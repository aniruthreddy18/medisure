"use client";

import { useCallback } from "react";

/**
 * Razorpay Checkout, loaded on demand.
 *
 * The script is only fetched when a patient actually reaches payment, so
 * browsing the site never pulls a third-party payment script.
 *
 * When the backend has no gateway configured it returns a stub order. We do
 * not fake a payment in that case — the booking simply stays pending and the
 * confirmation page says so, which is honest and keeps the flow testable
 * without a Razorpay account.
 */

export type PaymentOrder = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  stub: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type CheckoutResult =
  | { status: "paid"; ref?: string }
  | { status: "pending"; reason: "stub" | "script_failed" }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

export function useRazorpayCheckout() {
  return useCallback(
    async (params: {
      order: PaymentOrder;
      patientName: string;
      phone: string;
      email?: string | null;
      description: string;
    }): Promise<CheckoutResult> => {
      const { order } = params;

      // No gateway configured — leave the booking pending rather than
      // pretending money changed hands.
      if (order.stub || !order.keyId) {
        return { status: "pending", reason: "stub" };
      }

      const ready = await loadScript();
      if (!ready) return { status: "pending", reason: "script_failed" };

      return new Promise<CheckoutResult>((resolve) => {
        const rzp = new window.Razorpay!({
          key: order.keyId,
          amount: order.amountPaise,
          currency: order.currency,
          name: "MediSure Hospital",
          description: params.description,
          order_id: order.orderId,
          prefill: {
            name: params.patientName,
            contact: params.phone,
            ...(params.email ? { email: params.email } : {}),
          },
          theme: { color: "#c63630" },
          modal: {
            ondismiss: () => resolve({ status: "dismissed" }),
          },
          handler: async (response: Record<string, string>) => {
            try {
              // Verified server-side. This only speeds up what the patient
              // sees — the webhook remains the authority.
              const res = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const json = await res.json();
              if (!res.ok) {
                resolve({ status: "failed", message: json.error ?? "Payment could not be verified." });
                return;
              }
              resolve({ status: "paid", ref: json.ref });
            } catch {
              // The money may well have been taken — the webhook will settle
              // it, so do not tell the patient it failed.
              resolve({ status: "pending", reason: "script_failed" });
            }
          },
        });

        rzp.open();
      });
    },
    [],
  );
}
