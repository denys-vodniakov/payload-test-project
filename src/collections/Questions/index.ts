import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'

// Extended Lexical editor for questions and answer options
const questionRichTextEditor = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
      BlocksFeature({ blocks: [Code, MediaBlock] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ]
  },
})

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'difficulty'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'question',
      type: 'richText',
      required: true,
      editor: questionRichTextEditor,
      admin: {
        description: 'Question text with formatting, headings, code, images and video support',
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
      ],
      admin: {
        description: 'Question category',
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
      ],
      admin: {
        description: 'Difficulty level',
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
          type: 'richText',
          required: true,
          editor: questionRichTextEditor,
          admin: {
            description: 'Answer text with formatting, headings, code, images and video support',
          },
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is this answer option correct',
          },
        },
      ],
      admin: {
        description: 'Варианты ответов',
      },
    },
    {
      name: 'answerFeedback',
      type: 'array',
      admin: {
        description: 'Materials for feedback on each answer option (correct/incorrect)',
      },
      fields: [
        {
          name: 'optionIndex',
          type: 'number',
          required: true,
          admin: {
            description: 'Answer option index (starts from 0)',
          },
        },
        {
          name: 'correctAnswerFeedback',
          type: 'richText',
          editor: questionRichTextEditor,
          admin: {
            description: 'Materials for showing when the answer is correct (text, images, video, code, etc.)',
          },
        },
        {
          name: 'incorrectAnswerFeedback',
          type: 'richText',
          editor: questionRichTextEditor,
          admin: {
            description: 'Materials for showing when the answer is incorrect (text, images, video, code, etc.)',
          },
        },
      ],
    },
    {
      name: 'explanation',
      type: 'textarea',
      admin: {
        description: 'Explanation of the correct answer (deprecated field, use answerFeedback)',
      },
    },
  ],
  timestamps: true,
}
