'use client'

import { Participation } from '@/payload-types'
import { useEffect, useState } from 'react'
import NextButton from './NextButton'
import { markProgress } from '../_actions/MarkProgress'
import { HiDocumentSearch } from 'react-icons/hi'

interface QuizModuleProps {
  module: any
  participation: Participation
  onCompleted: (nextIndex: number) => void
}

export default function QuizModule({ module, participation, onCompleted }: QuizModuleProps) {
  const [message, setMessage] = useState<string>('')
  const [userAnswers, setUserAnswers] = useState<boolean[][]>([])
  const [loading, setLoading] = useState(false)
  const [allAnswerCorrect, setAllAnswerCorrect] = useState(false)

  useEffect(() => {
    setEmptyUseranswers()
  }, [])

  function setEmptyUseranswers() {
    let temp: any[] = []
    temp = module.questions.map((question: any) => {
      return question.answers.map(() => false)
    })
    setUserAnswers(temp)
  }

  async function handleNextModule() {
    if (loading) return
    setLoading(true)
    try {
      const res = await markProgress(participation.id)

      if (typeof res?.progress === 'number') {
        onCompleted(res.progress)
      } else {
        console.error('Error updating participation progress (no progress returned)')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function checkAnswer(answerIndex: number) {
    let correct = true
    const length = module.questions[answerIndex].answers.length

    for (let n = 0; n < length; n++) {
      const val = module.questions[answerIndex].answers[n].true ? true : false
      if (val !== userAnswers[answerIndex][n]) {
        correct = false
        break
      }
    }
    return correct
  }

  function checkAllAnswers() {
    for (let i = 0; i < module.questions.length; i++) {
      if (!checkAnswer(i)) {
        return false
      }
    }
    return true
  }

  function handleCheckAnswers() {
    if (checkAllAnswers()) {
      setAllAnswerCorrect(true)
      setUserAnswers([])
    } else {
      setMessage('Some answers are incorrect. Multiple answers can be correct')
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold">{module.title}</h2>

      <div className="relative w-full aspect-video border border-white overflow-y-auto p-6">
        {module.questions.map((question: any, index: number) => {
          return (
            <div key={index} className="flex flex-col gap-4 mb-6">
              <p className="font-bold">
                {index + 1}. {question.question}
              </p>

              {question.answers.map((answer: any, answerIndex: number) => {
                const inputId = `answer-${index}-${answerIndex}`
                return (
                  <div className="flex items-center cursor-pointer" key={`${index}-${answerIndex}`}>
                    <input
                      id={inputId}
                      type="checkbox"
                      onClick={(e) => {
                        setMessage('')
                        const tempAns = JSON.parse(JSON.stringify(userAnswers))
                        tempAns[index][answerIndex] = e.currentTarget.checked
                        setUserAnswers(tempAns)
                      }}
                      className="h-4 w-4 text-teal-400 bg-gray-100 border-gray-600 rounded-full focus:ring-2 focus:ring-teal-500"
                    />
                    <label
                      htmlFor={inputId}
                      className="ml-4 text-white text-2xl font-medium text-gray-300"
                    >
                      {answer.answer}
                    </label>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {message && <div className="text-red-500 p-2 font-bold">{message}</div>}

      <div className="flex flex-col gap-4 justify-center">
        {allAnswerCorrect ? (
          <NextButton loading={loading} text="Next" onClick={handleNextModule} />
        ) : (
          <div>
            <button
              disabled={allAnswerCorrect}
              onClick={handleCheckAnswers}
              className="inline-flex gap-2 items-center border border-white px-4 py-2"
            >
              Check Answers
              <HiDocumentSearch className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
