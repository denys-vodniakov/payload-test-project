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

// Helper function to extract text from richText
const extractTextFromRichText = (richText: any): string => {
  if (!richText || typeof richText !== 'object') return ''

  try {
    // Lexical editor stores content in root.children array
    const root = richText.root || richText
    const children = root.children || []

    // Extract text from paragraph nodes
    const textParts: string[] = []
    const extractText = (node: any) => {
      if (node.text) {
        textParts.push(node.text)
      }
      if (node.children) {
        node.children.forEach(extractText)
      }
    }

    children.forEach(extractText)
    const text = textParts.join(' ').trim()
    return text || ''
  } catch (error) {
    return ''
  }
}

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'questionTitle',
    defaultColumns: ['questionTitle', 'category', 'difficulty'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'questionTitle',
      type: 'text',
      admin: {
        description: 'Question title (auto-generated from question text)',
        readOnly: true,
        hidden: true,
      },
    },
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
          type: 'select',
          required: true,
          admin: {
            description:
              'Select answer option index (0-based). Make sure you have created the corresponding option first.',
          },
          options: [
            { label: 'Option 1 (Index 0)', value: '0' },
            { label: 'Option 2 (Index 1)', value: '1' },
            { label: 'Option 3 (Index 2)', value: '2' },
            { label: 'Option 4 (Index 3)', value: '3' },
            { label: 'Option 5 (Index 4)', value: '4' },
            { label: 'Option 6 (Index 5)', value: '5' },
          ],
        },
        {
          name: 'correctAnswerFeedback',
          type: 'richText',
          editor: questionRichTextEditor,
          admin: {
            description:
              'Materials for showing when the answer is correct (text, images, video, code, etc.)',
          },
        },
        {
          name: 'incorrectAnswerFeedback',
          type: 'richText',
          editor: questionRichTextEditor,
          admin: {
            description:
              'Materials for showing when the answer is incorrect (text, images, video, code, etc.)',
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
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-generate questionTitle from question richText
        if (data?.question) {
          const extractedText = extractTextFromRichText(data.question)
          if (extractedText) {
            data.questionTitle = extractedText.substring(0, 100) || 'Untitled Question'
          } else if (!data.questionTitle) {
            data.questionTitle = 'Untitled Question'
          }
        } else if (!data.questionTitle) {
          data.questionTitle = 'Untitled Question'
        }

        // Convert optionIndex from string to number in answerFeedback
        if (data?.answerFeedback && Array.isArray(data.answerFeedback)) {
          data.answerFeedback = data.answerFeedback.map((feedback: any) => {
            if (feedback?.optionIndex !== undefined) {
              const index =
                typeof feedback.optionIndex === 'string'
                  ? parseInt(feedback.optionIndex, 10)
                  : feedback.optionIndex
              return {
                ...feedback,
                optionIndex: isNaN(index) ? 0 : index,
              }
            }
            return feedback
          })
        }

        return data
      },
    ],
  },
  timestamps: true,
}
