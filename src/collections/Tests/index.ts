import type { CollectionConfig } from 'payload'

export const Tests: CollectionConfig = {
  slug: 'tests',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isActive'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Test title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Test description',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'React', value: 'react' },
        { label: 'Next.js', value: 'nextjs' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'CSS/HTML', value: 'css-html' },
        { label: 'General questions', value: 'general' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        description: 'Test category',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        description: 'Difficulty level',
      },
    },
    {
      name: 'timeLimit',
      type: 'number',
      admin: {
        description: 'Time limit in minutes (0 = no limit)',
      },
    },
    {
      name: 'questions',
      type: 'relationship',
      relationTo: 'questions',
      hasMany: true,
      admin: {
        description: 'Questions for the test (required)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Is the test active',
      },
    },
    {
      name: 'passingScore',
      type: 'number',
      defaultValue: 70,
      admin: {
        description: 'Percentage for passing the test',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          const questions = data?.questions

          // Validate that at least one question is provided
          if (!questions) {
            throw new Error('You must add at least one question to the test')
          }

          if (Array.isArray(questions)) {
            const validQuestions = questions.filter((q) => q !== null && q !== undefined)
            if (validQuestions.length === 0) {
              throw new Error('You must add at least one question to the test')
            }
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
