'use client'

import { useEffect, useState } from 'react'
import { markProgress } from '../_actions/MarkProgress'
import NextButton from './NextButton'
import type { Participation } from '@/payload-types'

// Bentuk data yang dipakai komponen
type Answer = { answer: string; true: boolean }
type Question = { question: string; answers: Answer[] }
interface QuizModuleProps {
  module: { title: string; questions: Question[] }
  participation: Participation
  onCompleted: (nextIndex: number) => void
}

export default function QuizModule({ module, participation, onCompleted }: QuizModuleProps) {
  // userAnswers[qIndex][aIndex] = apakah checkbox dipilih
  const [userAnswers, setUserAnswers] = useState<boolean[][]>([])
  const [checked, setChecked] = useState(false) // sudah tekan "Check Answers"
  const [perQuestionOK, setPerQuestionOK] = useState<boolean[]>([])
  const [allOK, setAllOK] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Inisialisasi setiap module berubah
  useEffect(() => {
    const init = module.questions.map((q) => q.answers.map(() => false))
    setUserAnswers(init)
    setPerQuestionOK(module.questions.map(() => false))
    setChecked(false)
    setAllOK(false)
    setMessage('')
  }, [module])

  // Toggle 1 checkbox (controlled component)
  function toggleAnswer(qi: number, ai: number, val: boolean) {
    setMessage('')
    setUserAnswers((prev) => {
      const next = prev.map((row) => row.slice())
      next[qi][ai] = val
      return next
    })
  }

  // Apakah 1 pertanyaan benar (dibandingkan exact dengan truth)
  function isCorrect(qi: number, ua: boolean[][]): boolean {
    const truth = module.questions[qi].answers.map((a) => Boolean(a.true))
    const chosen = ua[qi]
    if (!chosen || chosen.length !== truth.length) return false
    for (let i = 0; i < truth.length; i++) {
      if (truth[i] !== Boolean(chosen[i])) return false
    }
    return true
  }

  // Hitung hasil saat menekan "Check Answers"
  function checkAnswers() {
    const okList: boolean[] = []
    for (let qi = 0; qi < module.questions.length; qi++) {
      okList.push(isCorrect(qi, userAnswers))
    }
    setPerQuestionOK(okList)
    const all = okList.every(Boolean)
    setAllOK(all)
    setChecked(true)
    setMessage(all ? '' : 'Ada jawaban yang salah. Periksa tanda di bawah.')
    if (!all) {
      const firstWrong = okList.findIndex((v) => !v)
      if (firstWrong >= 0) {
        document
          .getElementById(`q-${firstWrong}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Reset jawaban (opsional)
  function resetAnswers() {
    const init = module.questions.map((q) => q.answers.map(() => false))
    setUserAnswers(init)
    setPerQuestionOK(module.questions.map(() => false))
    setChecked(false)
    setAllOK(false)
    setMessage('')
  }

  // Lanjut module
  async function handleNext() {
    if (loading) return
    setLoading(true)
    try {
      const res = await markProgress(participation.id)
      if (typeof res?.progress === 'number') onCompleted(res.progress)
      else console.error('progress tidak tersedia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold">{module.title}</h2>

      <div className="w-full max-h-[60vh] overflow-y-auto border border-white/20 rounded p-4">
        {module.questions.map((q, qi) => {
          const ok = perQuestionOK[qi]
          return (
            <div id={`q-${qi}`} key={qi} className="mb-6">
              <p className="font-semibold mb-2">
                {qi + 1}. {q.question}{' '}
                {checked && (
                  <span className={`text-sm ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ok ? '(Benar)' : '(Perlu diperbaiki)'}
                  </span>
                )}
              </p>

              {q.answers.map((a, ai) => {
                const selected = Boolean(userAnswers[qi]?.[ai])
                // setelah check: tandai hanya yang DIPILIH
                const showGood = checked && selected && a.true
                const showBad = checked && selected && !a.true

                return (
                  <label key={`${qi}-${ai}`} className="flex items-center gap-3 py-1">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => toggleAnswer(qi, ai, e.currentTarget.checked)}
                      className="h-4 w-4"
                      aria-invalid={showBad}
                    />
                    <span
                      className={`text-lg ${
                        showGood ? 'text-emerald-400' : showBad ? 'text-rose-400' : 'text-gray-200'
                      }`}
                    >
                      {a.answer}
                      {showGood && ' (benar)'}
                      {showBad && ' (salah)'}
                    </span>
                  </label>
                )
              })}
            </div>
          )
        })}
      </div>

      {message && <div className="text-rose-400">{message}</div>}

      <div className="flex items-center gap-3">
        {!allOK ? (
          <>
            <button onClick={checkAnswers} className="border border-white/40 px-4 py-2">
              Check Answers
            </button>
            {checked && (
              <button onClick={resetAnswers} className="text-sm border border-white/20 px-3 py-2">
                Reset
              </button>
            )}
          </>
        ) : (
          <NextButton loading={loading} text="Next" onClick={handleNext} />
        )}
      </div>
    </div>
  )
}
