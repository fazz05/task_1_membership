'use client'

import { useRouter } from 'next/navigation'
import React, { FormEvent, ReactElement, useState } from 'react'
import { login, LoginResponse } from '../_actions/login'
import Link from 'next/link'
import SubmitButton from '../../components/SubmitButton'

export default function LoginForm(): ReactElement {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result: LoginResponse = await login({ email, password })

    setIsPending(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-black-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-black-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Login</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <SubmitButton loading={isPending} text="Login" />
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  )
}

// Dari sini
