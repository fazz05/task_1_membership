"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, ReactElement, useState } from "react";
import { login, LoginResponse } from "../_actions/login";
import Link from "next/link";
import SubmitButton from "../../components/SubmitButton";

export default function LoginForm(): ReactElement {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result: LoginResponse = await login({ email, password });

    setIsPending(false);

    if (result.success) {
      // Redirect manually after successful login
      router.push("/dashboard");
    } else {
      // Display the error message
      setError(result.error || "Login failed");
    }
  }
  
  return (
  <main className="min-h-svh grid place-items-center px-4">
    <div className="w-full mx-auto max-w-sm">
      <h1 className="mb-6 text-center text-3xl">Login</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            className="rounded w-full textInput"
            name="email"
            id="email"
            type="email"
            required
          />
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor="password">Password</label>
          <input
            className="rounded w-full textInput"
            name="password"
            id="password"
            type="password"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <SubmitButton loading={isPending} text="Login" />
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold leading-6 text-headBlue-500 hover:text-headBlue-400"
        >
          Sign Up
        </Link>
      </p>
    </div>
  </main>
);
}
