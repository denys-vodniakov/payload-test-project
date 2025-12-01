import type { Block } from 'payload'

export const TestsCarousel: Block = {
  slug: 'testsCarousel',
  interfaceName: 'TestsCarouselBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Available Tests',
      admin: {
        description: 'Заголовок секции карусели',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: "Choose a test for the technology you're interested in and test your knowledge",
      admin: {
        description: 'Подзаголовок секции карусели',
      },
    },
    {
      name: 'testSelectionMode',
      type: 'select',
      required: true,
      defaultValue: 'latest',
      options: [
        {
          label: 'Последние тесты (автоматически)',
          value: 'latest',
        },
        {
          label: 'Ручной выбор тестов',
          value: 'manual',
        },
        {
          label: 'По категории',
          value: 'category',
        },
        {
          label: 'По сложности',
          value: 'difficulty',
        },
      ],
      admin: {
        description: 'Режим выбора тестов для отображения',
      },
    },
    {
      name: 'manualTests',
      type: 'relationship',
      relationTo: 'tests',
      hasMany: true,
      admin: {
        condition: (data) => data.testSelectionMode === 'manual',
        description: 'Выберите тесты для отображения в карусели',
      },
    },
    {
      name: 'categoryFilter',
      type: 'select',
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
        condition: (data) => data.testSelectionMode === 'category',
        description: 'Фильтр по категории',
      },
    },
    {
      name: 'difficultyFilter',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        condition: (data) => data.testSelectionMode === 'difficulty',
        description: 'Фильтр по сложности',
      },
    },
    {
      name: 'sortOrder',
      type: 'select',
      required: true,
      defaultValue: 'createdAt-desc',
      options: [
        {
          label: 'Сначала новые (по дате создания)',
          value: 'createdAt-desc',
        },
        {
          label: 'Сначала старые (по дате создания)',
          value: 'createdAt-asc',
        },
        {
          label: 'По названию (А-Я)',
          value: 'title-asc',
        },
        {
          label: 'По названию (Я-А)',
          value: 'title-desc',
        },
        {
          label: 'По дате обновления (новые)',
          value: 'updatedAt-desc',
        },
        {
          label: 'По дате обновления (старые)',
          value: 'updatedAt-asc',
        },
      ],
      admin: {
        description: 'Порядок сортировки тестов',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 50,
      admin: {
        description: 'Максимальное количество тестов для отображения',
      },
    },
    {
      name: 'slidesToShow',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
      admin: {
        description: 'Количество видимых слайдов одновременно (для десктопа)',
      },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Автоматическая прокрутка карусели',
      },
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 4000,
      min: 1000,
      max: 10000,
      admin: {
        condition: (data) => data.autoplay === true,
        description: 'Скорость автопрокрутки в миллисекундах (рекомендуется кратно 500)',
      },
    },
  ],
  labels: {
    plural: 'Tests Carousels',
    singular: 'Tests Carousel',
  },
}

