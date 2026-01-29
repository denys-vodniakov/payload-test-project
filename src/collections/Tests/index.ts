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
    // SEO Meta fields
    {
      name: 'meta',
      type: 'group',
      label: 'SEO & Meta',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Custom title for search engines (defaults to test title if empty)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Description for search engines (max 160 characters recommended)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords',
          admin: {
            description: 'Comma-separated keywords for SEO',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Social Share Image',
          admin: {
            description: 'Image for social media sharing (OpenGraph/Twitter)',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          label: 'No Index',
          defaultValue: false,
          admin: {
            description: 'Prevent search engines from indexing this test',
          },
        },
      ],
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
