import type { CollectionBeforeChangeHook } from 'payload'

export const validateTest: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  // Validate that questions array is not empty
  if (operation === 'create' || operation === 'update') {
    if (!data.questions || data.questions.length === 0) {
      throw new Error('Test must have at least one question')
    }
  }

  // Validate that at least one question has correct answers
  if (data.questions && data.questions.length > 0) {
    // This validation will be handled by the Questions collection
    // We just ensure the relationship is valid
  }

  return data
}
