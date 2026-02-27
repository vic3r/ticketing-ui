"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const seatIdsParam = searchParams?.get("seatIds") ?? "";
  const seatIds = seatIdsParam ? seatIdsParam.split(",").filter(Boolean) : [];
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || seatIds.length === 0 || !id) {
      setStatus("error");
      setError("Missing user, seats, or event.");
      logger.warn("Checkout skipped", { hasUser: !!user, seatCount: seatIds.length, eventId: id });
      return;
    }
    logger.info("Checkout started", { eventId: id, seatCount: seatIds.length, userId: user.id });
    api.orders
      .checkout({
        userId: user.id,
        eventId: id,
        seatIds,
        tierId: seatIds[0] ?? "",
        email: user.email,
      })
      .then((res) => {
        setOrderId(res.orderId);
        setClientSecret(res.clientSecret);
        setStatus(res.clientSecret ? "success" : "error");
        if (!res.clientSecret) setError("No payment intent returned.");
        if (res.clientSecret) logger.info("Checkout success", { orderId: res.orderId });
        else logger.warn("Checkout no clientSecret", { orderId: res.orderId });
      })
      .catch((e) => {
        setStatus("error");
        const msg = e instanceof Error ? e.message : "Checkout failed";
        setError(msg);
        logger.error("Checkout failed", { eventId: id, message: msg });
      });
  }, [user, seatIds, id]);

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-ink-600">Please log in to complete checkout.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-ink-600">Preparing checkout...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-red-600">{error}</p>
        <Link href={`/events/${id}/seats`} className="mt-4 inline-block text-brand-600 hover:underline">
          Back to seat selection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-normal text-ink-900">Complete payment</h1>
      <p className="mt-2 text-ink-600">Order {orderId}. Add Stripe Elements to collect payment.</p>
      {clientSecret && (
        <p className="mt-4 rounded-lg bg-brand-50 p-4 font-mono text-sm text-ink-700">
          Payment intent ready. Integrate Stripe Elements here.
        </p>
      )}
    </div>
  );
}
