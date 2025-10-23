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
        description: 'Пользователь, прошедший тест',
      },
    },
    {
      name: 'test',
      type: 'relationship',
      relationTo: 'tests',
      required: true,
      admin: {
        description: 'Пройденный тест',
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
            description: 'Время на ответ в секундах',
          },
        },
      ],
      admin: {
        description: 'Ответы пользователя',
      },
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      admin: {
        description: 'Процент правильных ответов',
      },
    },
    {
      name: 'totalQuestions',
      type: 'number',
      required: true,
      admin: {
        description: 'Общее количество вопросов',
      },
    },
    {
      name: 'correctAnswers',
      type: 'number',
      required: true,
      admin: {
        description: 'Количество правильных ответов',
      },
    },
    {
      name: 'timeSpent',
      type: 'number',
      admin: {
        description: 'Общее время прохождения в секундах',
      },
    },
    {
      name: 'isPassed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Прошел ли пользователь тест',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Дата и время завершения теста',
      },
    },
  ],
  timestamps: true,
}
