"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      router.push("/events");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Sign up
      </h1>
      <p className="mt-2 text-ink-600">
        Create an account to reserve seats and book tickets.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
