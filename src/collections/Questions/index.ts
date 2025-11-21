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
            description: 'Select answer option index',
          },
          options: (({ data, siblingData }: { data?: any; siblingData?: any }) => {
            // Get options from the parent document
            // In nested array fields, data contains the parent document
            const parentData = data || siblingData
            const options = parentData?.options || []

            // Generate options based on existing answer options
            if (!options || options.length === 0) {
              return [
                {
                  label: 'No options available - add options first',
                  value: 0,
                },
              ]
            }

            return options.map((_: any, index: number) => ({
              label: `Option ${index + 1} (Index ${index})`,
              value: index,
            }))
          }) as any,
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
        return data
      },
    ],
  },
  timestamps: true,
}
