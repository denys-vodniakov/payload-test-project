import type { CollectionBeforeChangeHook } from 'payload'

export const validateQuestion: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  // Validate that options array has at least 2 options
  if (operation === 'create' || operation === 'update') {
    if (!data.options || data.options.length < 2) {
      throw new Error('Question must have at least 2 options')
    }

    // Validate that at least one option is marked as correct
    const hasCorrectAnswer = data.options.some((option: any) => option.isCorrect === true)
    if (!hasCorrectAnswer) {
      throw new Error('Question must have at least one correct answer')
    }

    // Validate that all options have text
    const hasEmptyOptions = data.options.some(
      (option: any) => !option.text || option.text.trim() === '',
    )
    if (hasEmptyOptions) {
      throw new Error('All options must have text')
    }
  }

  return data
}
