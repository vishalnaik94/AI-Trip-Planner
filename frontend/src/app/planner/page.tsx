"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { tripsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Heart,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const INTERESTS = [
  "Adventure",
  "Culture",
  "Food",
  "Relaxation",
  "Shopping",
  "Nature",
  "Nightlife",
  "History",
  "Art",
  "Sports",
  "Photography",
  "Wildlife",
];

export default function PlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("mid-range");
  const [travelerType, setTravelerType] = useState("solo");
  const [interests, setInterests] = useState<string[]>([]);
  const [specialRequirements, setSpecialRequirements] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await tripsApi.create({
        destination,
        startDate,
        endDate,
        budget,
        travelerType,
        interests: interests.map((i) => i.toLowerCase()),
        specialRequirements: specialRequirements || undefined,
      });
      const trip = res.data.data ?? res.data;
      router.push(`/itinerary/${trip.id}?generate=true`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create trip. Please try again."
      );
      setLoading(false);
    }
  };

  const canNext =
    (step === 1 && destination && startDate && endDate) ||
    (step === 2 && budget && travelerType) ||
    (step === 3 && interests.length > 0);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Plan Your Trip</h1>
          <p className="mt-1 text-sm text-muted">
            Fill in your preferences and let AI craft the perfect itinerary
          </p>
        </div>

        {/* Step indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  s === step
                    ? "bg-primary text-white"
                    : s < step
                      ? "bg-success text-white"
                      : "bg-muted/20 text-muted"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-10 rounded ${
                    s < step ? "bg-success" : "bg-muted/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {/* Step 1: Destination & Dates */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Where & When
              </h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, France"
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Traveler Type */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5 text-primary" />
                Budget & Travel Style
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Budget Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "budget", label: "Budget", icon: "$" },
                    { value: "mid-range", label: "Mid-Range", icon: "$$" },
                    { value: "luxury", label: "Luxury", icon: "$$$" },
                  ].map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setBudget(b.value)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        budget === b.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="text-xl font-bold">{b.icon}</div>
                      <div className="mt-1 text-sm font-medium">{b.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <Users className="h-3.5 w-3.5 text-muted" />
                  Traveler Type
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {["solo", "couple", "family", "group"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTravelerType(t)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium capitalize transition-all ${
                        travelerType === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests & Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Heart className="h-5 w-5 text-primary" />
                Interests & Preferences
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select your interests (at least 1)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                        interests.includes(interest)
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Special Requirements (optional)
                </label>
                <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={3}
                  placeholder="e.g. Vegetarian meals, wheelchair accessibility, visa concerns..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canNext}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "Creating..." : "Create & Generate Itinerary"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
