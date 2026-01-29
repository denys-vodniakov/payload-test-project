import type { CollectionConfig } from 'payload'

export const TestResults: CollectionConfig = {
  slug: 'test-results',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'test', 'score', 'completedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return false
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who passed the test',
      },
    },
    {
      name: 'test',
      type: 'relationship',
      relationTo: 'tests',
      required: true,
      admin: {
        description: 'Passed test',
      },
    },
    {
      name: 'answers',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'questions',
          required: true,
        },
        {
          name: 'selectedOptions',
          type: 'array',
          fields: [
            {
              name: 'optionIndex',
              type: 'number',
              required: true,
            },
          ],
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'timeSpent',
          type: 'number',
          admin: {
            description: 'Time spent on the answer in seconds',
          },
        },
      ],
      admin: {
        description: 'Answers of the user',
      },
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      admin: {
        description: 'Percentage of correct answers',
      },
    },
    {
      name: 'totalQuestions',
      type: 'number',
      required: true,
      admin: {
        description: 'Total number of questions',
      },
    },
    {
      name: 'correctAnswers',
      type: 'number',
      required: true,
      admin: {
        description: 'Number of correct answers',
      },
    },
    {
      name: 'timeSpent',
      type: 'number',
      admin: {
        description: 'Total time spent on the test in seconds',
      },
    },
    {
      name: 'isPassed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user passed the test',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Date and time of completion of the test',
      },
    },
  ],
  timestamps: true,
}
