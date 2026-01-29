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
      defaultValue: 'Untitled Question',
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
        {
          name: 'feedback',
          type: 'array',
          admin: {
            description: 'Feedback materials for this answer option',
          },
          fields: [
            {
              name: 'feedbackType',
              type: 'select',
              defaultValue: 'correct',
              options: [
                {
                  label: 'Feedback for correct answer',
                  value: 'correct',
                },
                {
                  label: 'Feedback for incorrect answer',
                  value: 'incorrect',
                },
              ],
              admin: {
                description: 'Select feedback type - for correct or incorrect answer',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: questionRichTextEditor,
              admin: {
                description:
                  'Feedback content (text, images, video, code, etc.) to show when this option is selected',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Answer options with feedback materials',
      },
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
        if (operation !== 'create' && operation !== 'update') {
          return data
        }

        if (!data) {
          return data
        }

        const processedData = { ...data }

        // Auto-generate question title from rich text content
        if (processedData.question !== undefined && processedData.question !== null) {
          try {
            const extractedText = extractTextFromRichText(processedData.question)
            if (extractedText) {
              processedData.questionTitle = extractedText.substring(0, 100) || 'Untitled Question'
            } else if (!processedData.questionTitle) {
              processedData.questionTitle = 'Untitled Question'
            }
          } catch {
            if (!processedData.questionTitle) {
              processedData.questionTitle = 'Untitled Question'
            }
          }
        } else if (!processedData.questionTitle) {
          processedData.questionTitle = 'Untitled Question'
        }

        // Process and normalize options
        if (processedData.options && Array.isArray(processedData.options)) {
          processedData.options = processedData.options.map((option: any) => {
            if (!option || typeof option !== 'object') {
              return option
            }

            const processedOption: any = {
              text: option.text,
              isCorrect: Boolean(option.isCorrect),
            }

            // Process feedback if present
            if (option.feedback && Array.isArray(option.feedback) && option.feedback.length > 0) {
              const cleanedFeedback = option.feedback
                .filter((fb: any) => fb && typeof fb === 'object')
                .map((fb: any) => ({
                  feedbackType:
                    fb.feedbackType === 'correct' || fb.feedbackType === 'incorrect'
                      ? fb.feedbackType
                      : 'correct',
                  ...(fb.content !== undefined && { content: fb.content }),
                }))
                .filter((fb: any) => Object.keys(fb).length > 0)

              if (cleanedFeedback.length > 0) {
                processedOption.feedback = cleanedFeedback
              }
            }

            return processedOption
          })
        }

        return processedData
      },
    ],
  },
  timestamps: true,
}
