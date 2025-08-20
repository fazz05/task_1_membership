'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent, ReactElement } from 'react'
import Link from 'next/link'
import { signup, SignupResponse } from '../actions/signup'
import SubmitButton from '../../components/SubmitButton'

export default function SignupForm(): ReactElement {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsPending(true)
    setError(null) // Reset error state

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsPending(false)
      return
    }

    const result: SignupResponse = await signup({ email, password })
    setIsPending(false)

    console.log(result)

    if (result.success) {
      // Redirect manually after successful login
      router.push('/dashboard')
    } else {
      // Display the error message
      setError(result.error || 'Login failed')
    }
  }
  // Dari sini
  return (
    <main className="min-h-screen grid place-items-center bg-black-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-black-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Sign Up</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <SubmitButton loading={isPending} text="Sign Up" />
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  )
}
