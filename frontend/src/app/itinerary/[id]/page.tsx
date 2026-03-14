"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { tripsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import {
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  Hotel,
  Lightbulb,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Activity {
  time: string;
  activity: string;
  location: string;
  estimatedCost: number;
  duration: string;
  notes?: string;
}

interface Meal {
  type: string;
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  hotel: { name: string; estimatedCost: number; rating?: number };
  meals: Meal[];
}

interface ItineraryData {
  days: DayPlan[];
  totalEstimatedCost: number;
  tips: string[];
  warnings: string[];
}

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelerType: string;
  interests: string[];
  status: string;
}

function ItineraryContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.id as string;
  const shouldGenerate = searchParams.get("generate") === "true";

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const fetchTrip = useCallback(async () => {
    try {
      const res = await tripsApi.getById(tripId);
      const data = res.data.data ?? res.data;
      setTrip(data);
      return data;
    } catch {
      setError("Trip not found");
      return null;
    }
  }, [tripId]);

  const fetchItinerary = useCallback(async () => {
    try {
      const res = await tripsApi.getItinerary(tripId);
      const data = res.data.data ?? res.data;
      setItinerary(data.rawJson);
    } catch {
      // No itinerary yet
    }
  }, [tripId]);

  const generateItinerary = useCallback(async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await tripsApi.generateItinerary(tripId);
      const data = res.data.data ?? res.data;
      setItinerary(data.rawJson);
      await fetchTrip();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to generate itinerary. Check your Gemini API key."
      );
    } finally {
      setGenerating(false);
    }
  }, [tripId, fetchTrip]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const init = async () => {
      const tripData = await fetchTrip();
      if (!tripData) {
        setLoading(false);
        return;
      }

      if (tripData.status === "completed") {
        await fetchItinerary();
      } else if (shouldGenerate && tripData.status === "draft") {
        setLoading(false);
        await generateItinerary();
        return;
      }
      setLoading(false);
    };

    init();
  }, [router, fetchTrip, fetchItinerary, generateItinerary, shouldGenerate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {trip && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{trip.destination}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(trip.startDate).toLocaleDateString()} —{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {trip.budget}
                  </span>
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    {trip.travelerType}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {trip.interests?.map((i) => (
                    <span
                      key={i}
                      className="rounded-full bg-muted/10 px-2.5 py-0.5 text-xs text-muted"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {!itinerary && !generating && (
                <button
                  onClick={generateItinerary}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Itinerary
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {generating && (
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                AI is crafting your itinerary...
              </h2>
              <p className="mt-1 text-sm text-muted">
                Gemini is analyzing destinations, hotels, activities, and local
                tips. This may take 15-30 seconds.
              </p>
            </div>
          </div>
        )}

        {itinerary && (
          <div className="mt-6 space-y-4">
            {/* Cost Summary */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <div className="text-sm text-muted">Total Estimated Cost</div>
                <div className="text-xl font-bold text-success">
                  ${itinerary.totalEstimatedCost?.toLocaleString() || "N/A"}
                </div>
              </div>
            </div>

            {/* Day-by-Day */}
            {itinerary.days?.map((day, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() =>
                    setExpandedDay(expandedDay === idx ? null : idx)
                  }
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {day.day}
                    </div>
                    <div>
                      <div className="font-semibold">Day {day.day}</div>
                      {day.date && (
                        <div className="text-xs text-muted">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {expandedDay === idx ? (
                    <ChevronUp className="h-5 w-5 text-muted" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted" />
                  )}
                </button>

                {expandedDay === idx && (
                  <div className="border-t border-border px-5 py-4 space-y-4">
                    {/* Activities */}
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">
                        Activities
                      </h4>
                      <div className="space-y-3">
                        {day.activities?.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-start gap-3 rounded-lg bg-background p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium">
                                    {act.activity}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                                    <span>{act.time}</span>
                                    <span>·</span>
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="h-3 w-3" />
                                      {act.location}
                                    </span>
                                    <span>·</span>
                                    <span>{act.duration}</span>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-success">
                                  ${act.estimatedCost}
                                </span>
                              </div>
                              {act.notes && (
                                <p className="mt-1 text-xs text-muted">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meals */}
                    {day.meals && day.meals.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">
                          Meals
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {day.meals.map((meal, mIdx) => (
                            <div
                              key={mIdx}
                              className="rounded-lg bg-background p-3"
                            >
                              <div className="flex items-center gap-1.5">
                                <Utensils className="h-3.5 w-3.5 text-accent" />
                                <span className="text-xs font-semibold uppercase text-accent">
                                  {meal.type}
                                </span>
                              </div>
                              <div className="mt-1 text-sm font-medium">
                                {meal.restaurant}
                              </div>
                              <div className="mt-0.5 flex items-center justify-between text-xs text-muted">
                                <span>{meal.cuisine}</span>
                                <span className="font-medium text-success">
                                  ${meal.estimatedCost}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hotel */}
                    {day.hotel && (
                      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                        <Hotel className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{day.hotel.name}</div>
                          <div className="text-xs text-muted">
                            {day.hotel.rating && `${day.hotel.rating} stars · `}
                            $
                            {day.hotel.estimatedCost}/night
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Tips & Warnings */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Travel Tips
                </h3>
                <ul className="mt-3 space-y-2">
                  {itinerary.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {itinerary.warnings && itinerary.warnings.length > 0 && (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-danger">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </h3>
                <ul className="mt-3 space-y-2">
                  {itinerary.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-danger/80"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}
