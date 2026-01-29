import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Modern Hero (with animated background)',
          value: 'modernHero',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'modernHero',
        description: 'Subtitle for hero section',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'showStats',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        condition: (_, { type } = {}) => type === 'modernHero',
        description: 'Show statistics',
      },
    },
    {
      name: 'stats',
      type: 'array',
      admin: {
        condition: (_, { type, showStats } = {}) => type === 'modernHero' && showStats,
        description: 'Statistics to display',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'Value (e.g., "1000+")',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Label (e.g., "Questions in database")',
          },
        },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'trophy',
          options: [
            { label: '🏆 Trophy', value: 'trophy' },
            { label: '⚡ Zap', value: 'zap' },
            { label: '⏰ Clock', value: 'clock' },
            { label: '👥 Users', value: 'users' },
            { label: '📚 Book', value: 'book' },
            { label: '⭐ Star', value: 'star' },
          ],
        },
      ],
    },
  ],
  label: false,
}
