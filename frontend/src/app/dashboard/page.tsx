"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { tripsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import {
  Plus,
  MapPin,
  Calendar,
  Loader2,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelerType: string;
  interests: string[];
  status: string;
  createdAt: string;
  itineraries?: { id: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchTrips();
  }, [router]);

  const fetchTrips = async () => {
    try {
      const res = await tripsApi.getAll();
      setTrips(res.data.data ?? res.data);
    } catch {
      console.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    setDeleting(id);
    try {
      await tripsApi.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete trip");
    } finally {
      setDeleting(null);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-700",
    generating: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Trips</h1>
            <p className="mt-1 text-sm text-muted">
              Manage your travel plans and AI-generated itineraries
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </Link>
        </div>

        {loading ? (
          <div className="mt-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <div className="mt-20 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted/40" />
            <h2 className="mt-4 text-lg font-semibold">No trips yet</h2>
            <p className="mt-1 text-sm text-muted">
              Create your first AI-powered trip plan
            </p>
            <Link
              href="/planner"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Sparkles className="h-4 w-4" />
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{trip.destination}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(trip.startDate).toLocaleDateString()} —{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[trip.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {trip.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {trip.budget}
                  </span>
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    {trip.travelerType}
                  </span>
                  {trip.interests?.slice(0, 2).map((i) => (
                    <span
                      key={i}
                      className="rounded-md bg-muted/10 px-2 py-0.5 text-xs text-muted"
                    >
                      {i}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  {trip.status === "completed" && trip.itineraries?.length ? (
                    <Link
                      href={`/itinerary/${trip.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Itinerary
                    </Link>
                  ) : trip.status === "draft" ? (
                    <Link
                      href={`/itinerary/${trip.id}?generate=true`}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate Itinerary
                    </Link>
                  ) : null}
                  <button
                    onClick={() => handleDelete(trip.id)}
                    disabled={deleting === trip.id}
                    className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                  >
                    {deleting === trip.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
