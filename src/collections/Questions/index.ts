import type { CollectionConfig } from 'payload'
import { validateQuestion } from './hooks/validateQuestion'

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'difficulty'],
  },
  access: {
    read: () => true,
    create: () => true, // Temporarily allow all users to create questions for debugging
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      admin: {
        description: 'Текст вопроса',
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
        { label: 'Общие вопросы', value: 'general' },
      ],
      admin: {
        description: 'Категория вопроса',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      options: [
        { label: 'Легкий', value: 'easy' },
        { label: 'Средний', value: 'medium' },
        { label: 'Сложный', value: 'hard' },
      ],
      admin: {
        description: 'Уровень сложности',
      },
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Варианты ответов',
      },
    },
    {
      name: 'explanation',
      type: 'textarea',
      admin: {
        description: 'Объяснение правильного ответа',
      },
    },
  ],
  hooks: {
    beforeChange: [validateQuestion],
  },
  timestamps: true,
}
