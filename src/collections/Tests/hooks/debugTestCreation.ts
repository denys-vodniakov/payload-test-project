import type { CollectionBeforeChangeHook } from 'payload'

export const debugTestCreation: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  console.log('=== TEST CREATION DEBUG ===')
  console.log('Operation:', operation)
  console.log('User:', req.user ? 'Authenticated' : 'Not authenticated')
  console.log('User ID:', req.user?.id)
  console.log('Data:', JSON.stringify(data, null, 2))
  console.log('===========================')

  return data
}
