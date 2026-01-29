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
      defaultValue: 'Why Choose Us?',
      admin: {
        description: 'Section title',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Section subtitle (optional)',
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
        description: 'Section description (optional)',
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
            description: 'Feature title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Feature description',
          },
        },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'zap',
          options: [
            { label: '⚡ Zap', value: 'zap' },
            { label: '🚀 Rocket', value: 'rocket' },
            { label: '🎯 Target', value: 'target' },
            { label: '💎 Diamond', value: 'diamond' },
            { label: '⭐ Star', value: 'star' },
            { label: '🔥 Fire', value: 'fire' },
            { label: '📚 Book', value: 'book' },
            { label: '🏆 Trophy', value: 'trophy' },
            { label: '⚙️ Settings', value: 'settings' },
            { label: '💡 Lightbulb', value: 'lightbulb' },
            { label: '🎨 Palette', value: 'palette' },
            { label: '🔒 Lock', value: 'lock' },
            { label: '📱 Smartphone', value: 'smartphone' },
            { label: '🌐 Globe', value: 'globe' },
            { label: '👥 Users', value: 'users' },
          ],
          admin: {
            description: 'Icon for the feature',
          },
        },
        {
          name: 'gradientColor',
          type: 'select',
          defaultValue: 'blue',
          options: [
            { label: 'Blue → Purple', value: 'blue' },
            { label: 'Green → Blue', value: 'green' },
            { label: 'Purple → Pink', value: 'purple' },
            { label: 'Orange → Red', value: 'orange' },
            { label: 'Pink → Purple', value: 'pink' },
            { label: 'Yellow → Orange', value: 'yellow' },
            { label: 'Cyan → Blue', value: 'cyan' },
            { label: 'Red → Pink', value: 'red' },
          ],
          admin: {
            description: 'Gradient color for the card',
          },
        },
      ],
      admin: {
        description: 'List of features',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
        { label: 'Carousel', value: 'carousel' },
      ],
      admin: {
        description: 'Display mode for features',
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
        description: 'Number of columns in the grid',
      },
    },
  ],
  labels: {
    plural: 'Why Choose Us Blocks',
    singular: 'Why Choose Us Block',
  },
}

