import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const WhyChooseUs: Block = {
  slug: 'whyChooseUs',
  interfaceName: 'WhyChooseUsBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Почему выбирают нас?',
      admin: {
        description: 'Заголовок секции',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Подзаголовок секции (опционально)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        description: 'Описание секции (опционально)',
      },
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Название преимущества',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Описание преимущества',
          },
        },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'zap',
          options: [
            { label: '⚡ Zap (Молния)', value: 'zap' },
            { label: '🚀 Rocket (Ракета)', value: 'rocket' },
            { label: '🎯 Target (Цель)', value: 'target' },
            { label: '💎 Diamond (Алмаз)', value: 'diamond' },
            { label: '⭐ Star (Звезда)', value: 'star' },
            { label: '🔥 Fire (Огонь)', value: 'fire' },
            { label: '📚 Book (Книга)', value: 'book' },
            { label: '🏆 Trophy (Трофей)', value: 'trophy' },
            { label: '⚙️ Settings (Настройки)', value: 'settings' },
            { label: '💡 Lightbulb (Лампочка)', value: 'lightbulb' },
            { label: '🎨 Palette (Палитра)', value: 'palette' },
            { label: '🔒 Lock (Замок)', value: 'lock' },
            { label: '📱 Smartphone (Телефон)', value: 'smartphone' },
            { label: '🌐 Globe (Глобус)', value: 'globe' },
            { label: '👥 Users (Пользователи)', value: 'users' },
          ],
          admin: {
            description: 'Иконка для преимущества',
          },
        },
        {
          name: 'gradientColor',
          type: 'select',
          defaultValue: 'blue',
          options: [
            { label: 'Синий → Фиолетовый', value: 'blue' },
            { label: 'Зеленый → Синий', value: 'green' },
            { label: 'Фиолетовый → Розовый', value: 'purple' },
            { label: 'Оранжевый → Красный', value: 'orange' },
            { label: 'Розовый → Фиолетовый', value: 'pink' },
            { label: 'Желтый → Оранжевый', value: 'yellow' },
            { label: 'Бирюзовый → Синий', value: 'cyan' },
            { label: 'Красный → Розовый', value: 'red' },
          ],
          admin: {
            description: 'Цвет градиента для карточки',
          },
        },
      ],
      admin: {
        description: 'Список преимуществ',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка (Grid)', value: 'grid' },
        { label: 'Список (List)', value: 'list' },
        { label: 'Карусель (Carousel)', value: 'carousel' },
      ],
      admin: {
        description: 'Способ отображения преимуществ',
      },
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 6,
      admin: {
        condition: (data) => data.layout === 'grid',
        description: 'Количество колонок в сетке',
      },
    },
  ],
  labels: {
    plural: 'Why Choose Us Blocks',
    singular: 'Why Choose Us Block',
  },
}

