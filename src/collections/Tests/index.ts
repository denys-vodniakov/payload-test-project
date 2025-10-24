import type { CollectionConfig } from 'payload'
import { validateTest } from './hooks/validateTest'

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
        description: 'Название теста',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Описание теста',
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
        { label: 'Смешанный', value: 'mixed' },
      ],
      admin: {
        description: 'Категория теста',
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
        { label: 'Смешанный', value: 'mixed' },
      ],
      admin: {
        description: 'Уровень сложности',
      },
    },
    {
      name: 'timeLimit',
      type: 'number',
      admin: {
        description: 'Время на прохождение в минутах (0 = без ограничений)',
      },
    },
    {
      name: 'questions',
      type: 'relationship',
      relationTo: 'questions',
      hasMany: true,
      required: true,
      admin: {
        description: 'Вопросы для теста',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Активен ли тест',
      },
    },
    {
      name: 'passingScore',
      type: 'number',
      defaultValue: 70,
      admin: {
        description: 'Процент для прохождения теста',
      },
    },
  ],
  hooks: {
    beforeChange: [validateTest],
  },
  timestamps: true,
}
