import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Answer {
  questionId: string
  selectedOptions: number[]
  timeSpent: number
}

interface TestProgress {
  testId: string
  answers: Answer[]
  currentQuestionIndex: number
  timeLeft: number | null
  startedAt: number
}

interface TestState {
  // Current test progress
  currentTest: TestProgress | null
  
  // Actions
  startTest: (testId: string, questionsCount: number, timeLimit?: number) => void
  setAnswer: (questionId: string, selectedOptions: number[]) => void
  updateTimeSpent: (questionIndex: number, timeSpent: number) => void
  setCurrentQuestionIndex: (index: number) => void
  decrementTimeLeft: () => void
  finishTest: () => Answer[]
  resetTest: () => void
  
  // Getters
  getCurrentAnswer: () => Answer | null
  getProgress: () => number
  isTestInProgress: (testId: string) => boolean
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      currentTest: null,
      
      startTest: (testId, questionsCount, timeLimit) => {
        const existingTest = get().currentTest
        
        // If resuming the same test, don't reset
        if (existingTest?.testId === testId) {
          return
        }
        
        set({
          currentTest: {
            testId,
            answers: Array(questionsCount).fill(null).map((_, i) => ({
              questionId: '',
              selectedOptions: [],
              timeSpent: 0,
            })),
            currentQuestionIndex: 0,
            timeLeft: timeLimit ? timeLimit * 60 : null,
            startedAt: Date.now(),
          },
        })
      },
      
      setAnswer: (questionId, selectedOptions) => {
        const { currentTest } = get()
        if (!currentTest) return
        
        const updatedAnswers = [...currentTest.answers]
        updatedAnswers[currentTest.currentQuestionIndex] = {
          ...updatedAnswers[currentTest.currentQuestionIndex],
          questionId,
          selectedOptions,
        }
        
        set({
          currentTest: {
            ...currentTest,
            answers: updatedAnswers,
          },
        })
      },
      
      updateTimeSpent: (questionIndex, timeSpent) => {
        const { currentTest } = get()
        if (!currentTest) return
        
        const updatedAnswers = [...currentTest.answers]
        if (updatedAnswers[questionIndex]) {
          updatedAnswers[questionIndex] = {
            ...updatedAnswers[questionIndex],
            timeSpent,
          }
        }
        
        set({
          currentTest: {
            ...currentTest,
            answers: updatedAnswers,
          },
        })
      },
      
      setCurrentQuestionIndex: (index) => {
        const { currentTest } = get()
        if (!currentTest) return
        
        set({
          currentTest: {
            ...currentTest,
            currentQuestionIndex: index,
          },
        })
      },
      
      decrementTimeLeft: () => {
        const { currentTest } = get()
        if (!currentTest || currentTest.timeLeft === null) return
        
        set({
          currentTest: {
            ...currentTest,
            timeLeft: Math.max(0, currentTest.timeLeft - 1),
          },
        })
      },
      
      finishTest: () => {
        const { currentTest } = get()
        if (!currentTest) return []
        
        const answers = [...currentTest.answers]
        // Note: Store is cleared via resetTest() after successful submission
        // flushSync ensures React state updates before resetTest is called
        return answers
      },
      
      resetTest: () => {
        set({ currentTest: null })
      },
      
      getCurrentAnswer: () => {
        const { currentTest } = get()
        if (!currentTest) return null
        return currentTest.answers[currentTest.currentQuestionIndex] || null
      },
      
      getProgress: () => {
        const { currentTest } = get()
        if (!currentTest) return 0
        
        const answeredCount = currentTest.answers.filter(
          (a) => a.selectedOptions.length > 0
        ).length
        return (answeredCount / currentTest.answers.length) * 100
      },
      
      isTestInProgress: (testId) => {
        const { currentTest } = get()
        if (!currentTest || currentTest.testId !== testId) return false
        
        // Only consider test "in progress" if there's at least one answered question
        const hasAnswers = currentTest.answers.some(a => a.selectedOptions.length > 0)
        return hasAnswers
      },
    }),
    {
      name: 'test-progress',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist currentTest
      partialize: (state) => ({ currentTest: state.currentTest }),
    }
  )
)
