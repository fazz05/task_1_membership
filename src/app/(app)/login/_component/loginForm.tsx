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
  
  return <div className="flex gap-8 min-h-full flex-col justify-center items-center">
    <div className="text-3xl">
      Login
    </div>
    <div className="w-full mx-auto sm:max-w-sm">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input className="rounded w-full textInput" name="email" id="email" type="email" />
        </div>
        <div className="flex flex-col gap-2 mb-8">
          <label htmlFor="password">Password</label>
          <input className="rounded w-full textInput" name="password" id="password" type="password" />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <SubmitButton loading={isPending} text="Login" />
      </form>
      <p className="mt-10 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold leading-6 text-headBlue-500 hover:text-headBlue-400">
            Sign Up
          </Link>
        </p>
    </div>
  </div>
}