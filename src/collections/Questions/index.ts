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
    beforeValidate: [
      ({ data, operation, req }) => {
        // Only process create/update operations - skip read/delete operations early
        // This prevents errors when opening the admin panel (read operations)
        if (operation !== 'create' && operation !== 'update') {
          return data
        }

        try {
          // Simple logging only - no complex operations
          // All complex validation and data processing is done in beforeChange hook
          console.log('🔍 [QUESTIONS] beforeValidate hook called', {
            operation,
            hasData: !!data,
          })

          if (req?.payload?.logger) {
            req.payload.logger.info('🔍 Questions beforeValidate hook called', {
              operation,
              hasData: !!data,
            })
          }

          // Critical validation only - let Payload handle the rest
          // Don't throw errors here - Payload will handle validation with proper error messages
          if (!data) {
            console.error('❌ [QUESTIONS] beforeValidate: data is null/undefined')
          }

          // Return data as-is - all processing happens in beforeChange
          return data
        } catch (error) {
          console.error('❌ [QUESTIONS] CRITICAL ERROR in beforeValidate hook:', error)
          if (req?.payload?.logger) {
            req.payload.logger.error('❌ Questions beforeValidate error:', error)
          }
          // Return data as-is to prevent breaking the operation
          return data
        }
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        // Only process create/update operations
        if (operation !== 'create' && operation !== 'update') {
          return data
        }

        console.log('📝 [QUESTIONS] beforeChange hook called', {
          operation,
          hasData: !!data,
          hasQuestion: !!data?.question,
          hasOptions: !!data?.options,
          optionsCount: Array.isArray(data?.options) ? data.options.length : 0,
        })

        if (!data) {
          console.error('⚠️ [QUESTIONS] beforeChange: data is null/undefined')
          if (req?.payload?.logger) {
            req.payload.logger.warn('⚠️ Questions beforeChange: data is null/undefined')
          }
          return data
        }

        try {
          // Log incoming data for debugging
          console.log('📝 [QUESTIONS] Processing data:', {
            operation,
            dataKeys: Object.keys(data),
            questionId: data.id || 'new',
            hasQuestion: !!data.question,
            hasOptions: !!data.options,
            optionsCount: Array.isArray(data.options) ? data.options.length : 0,
          })

          if (req?.payload?.logger) {
            req.payload.logger.info('📝 Questions beforeChange hook called', {
              operation,
              hasQuestion: !!data.question,
              hasOptions: !!data.options,
              optionsCount: Array.isArray(data.options) ? data.options.length : 0,
              dataKeys: Object.keys(data || {}),
              questionId: data.id || 'new',
              questionStructure: {
                hasRoot: !!data.question?.root,
                hasChildren: !!data.question?.children,
                rootType: data.question?.root ? typeof data.question.root : 'undefined',
                childrenType: data.question?.children ? typeof data.question.children : 'undefined',
              },
              optionsDetails: Array.isArray(data.options)
                ? data.options.map((opt: any, idx: number) => ({
                    index: idx,
                    hasText: !!opt?.text,
                    textType: opt?.text ? typeof opt.text : 'undefined',
                    textStructure: opt?.text
                      ? {
                          hasRoot: !!opt.text.root,
                          hasChildren: !!opt.text.children,
                          keys: Object.keys(opt.text),
                        }
                      : null,
                    isCorrect: opt?.isCorrect,
                    hasFeedback: !!opt?.feedback,
                    feedbackCount: Array.isArray(opt?.feedback) ? opt.feedback.length : 0,
                    optionKeys: opt ? Object.keys(opt) : [],
                    hasId: 'id' in (opt || {}),
                  }))
                : 'not-array',
            })
          }

          // Start with a copy of the data
          const processedData = { ...data }

          // Auto-generate questionTitle from question richText
          if (processedData.question !== undefined && processedData.question !== null) {
            try {
              const extractedText = extractTextFromRichText(processedData.question)
              if (extractedText) {
                processedData.questionTitle = extractedText.substring(0, 100) || 'Untitled Question'
              } else if (!processedData.questionTitle) {
                processedData.questionTitle = 'Untitled Question'
              }
            } catch (error) {
              if (req?.payload?.logger) {
                req.payload.logger.error('Error extracting text from question:', error)
              }
              if (!processedData.questionTitle) {
                processedData.questionTitle = 'Untitled Question'
              }
            }
          } else if (!processedData.questionTitle) {
            processedData.questionTitle = 'Untitled Question'
          }

          // Clean options data - remove unexpected fields like 'id' from options and feedback
          // IMPORTANT: Always keep all options to satisfy minRows: 2 requirement
          // Let Payload's validation handle invalid data with proper error messages
          if (processedData.options && Array.isArray(processedData.options)) {
            try {
              const originalOptionsCount = processedData.options.length

              if (req?.payload?.logger) {
                req.payload.logger.info('🔄 Processing options', {
                  count: originalOptionsCount,
                  options: processedData.options.map((opt: any, idx: number) => ({
                    index: idx,
                    type: typeof opt,
                    isObject: typeof opt === 'object',
                    keys: opt ? Object.keys(opt) : [],
                    hasText: !!opt?.text,
                    textValue: opt?.text
                      ? typeof opt.text === 'string'
                        ? opt.text.substring(0, 50)
                        : 'object'
                      : 'missing',
                  })),
                })
              }

              processedData.options = processedData.options.map((option: any, index: number) => {
                try {
                  if (!option || typeof option !== 'object') {
                    console.warn(`⚠️ [QUESTIONS] Option ${index} is not an object`, {
                      option,
                      type: typeof option,
                    })
                    if (req?.payload?.logger) {
                      req.payload.logger.warn(`⚠️ Option ${index} is not an object`, {
                        option,
                        type: typeof option,
                      })
                    }
                    return option
                  }

                  // Check if this is an old format question (might have different structure)
                  const isOldFormat =
                    !option.text || (typeof option.text === 'string' && !option.text.root)

                  if (isOldFormat && req?.payload?.logger) {
                    req.payload.logger.warn(`📌 Detected potentially old format option ${index}`, {
                      hasText: !!option.text,
                      textType: typeof option.text,
                      textValue:
                        typeof option.text === 'string'
                          ? option.text.substring(0, 100)
                          : option.text,
                      allKeys: Object.keys(option),
                    })
                  }

                  // Create a clean option object, removing any unexpected fields like 'id'
                  // Keep the option even if text is invalid - let Payload validation handle it
                  const processedOption: any = {
                    text: option.text, // Keep as-is, let Payload validate
                    isCorrect: Boolean(option.isCorrect),
                  }

                  // Handle feedback field - ensure it's properly formatted
                  if (option.feedback !== undefined && option.feedback !== null) {
                    if (Array.isArray(option.feedback) && option.feedback.length > 0) {
                      // Clean feedback array - remove invalid entries and ensure proper structure
                      const cleanedFeedback = option.feedback
                        .filter((fb: any) => fb && typeof fb === 'object')
                        .map((fb: any) => {
                          // Only include expected fields for feedback, remove any 'id' fields
                          const processedFb: any = {}

                          // Ensure feedbackType is valid
                          if (
                            fb.feedbackType &&
                            (fb.feedbackType === 'correct' || fb.feedbackType === 'incorrect')
                          ) {
                            processedFb.feedbackType = fb.feedbackType
                          } else {
                            processedFb.feedbackType = 'correct'
                          }

                          // Include content if it exists (even if empty, let Payload handle validation)
                          if (fb.content !== undefined) {
                            processedFb.content = fb.content
                          }

                          return processedFb
                        })
                        .filter((fb: any) => Object.keys(fb).length > 0)

                      // Only include feedback if we have valid entries
                      if (cleanedFeedback.length > 0) {
                        processedOption.feedback = cleanedFeedback
                      }
                    }
                    // If feedback is empty array or invalid, don't include it
                  }

                  return processedOption
                } catch (optionError) {
                  console.error(`❌ [QUESTIONS] Error processing option ${index}:`, optionError)
                  console.error('Option data:', option)
                  // Return option as-is if processing fails
                  return option
                }
              })

              if (req?.payload?.logger) {
                req.payload.logger.info('✅ Options processed successfully', {
                  originalCount: originalOptionsCount,
                  processedCount: processedData.options.length,
                  processedOptions: processedData.options.map((opt: any, idx: number) => ({
                    index: idx,
                    hasText: !!opt?.text,
                    textType: opt?.text ? typeof opt.text : 'undefined',
                    isCorrect: opt?.isCorrect,
                    hasFeedback: !!opt?.feedback,
                    keys: Object.keys(opt || {}),
                  })),
                })
              }
            } catch (error) {
              console.error('❌ [QUESTIONS] Error processing options:', error)
              console.error('Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                options: processedData.options,
                optionsType: typeof processedData.options,
                isArray: Array.isArray(processedData.options),
                originalOptions: data.options,
              })

              if (req?.payload?.logger) {
                req.payload.logger.error('❌ Error processing options:', error)
                req.payload.logger.error('Error details:', {
                  message: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined,
                  options: processedData.options,
                  optionsType: typeof processedData.options,
                  isArray: Array.isArray(processedData.options),
                })
              }
              // Ensure options remains a valid array even if processing failed
              // Restore original options if processing failed to avoid undefined state
              if (!Array.isArray(processedData.options)) {
                // If options became invalid during processing, try to restore from original data
                processedData.options = data.options || []
                console.warn('🔄 [QUESTIONS] Restored original options due to processing error')
                if (req?.payload?.logger) {
                  req.payload.logger.warn('🔄 Restored original options due to processing error')
                }
              }
            }
          } else {
            if (req?.payload?.logger) {
              req.payload.logger.warn('⚠️ Options is not an array', {
                options: processedData.options,
                optionsType: typeof processedData.options,
              })
            }
          }

          // Log final processed data structure
          if (req?.payload?.logger) {
            req.payload.logger.info('✅ Questions beforeChange hook completed successfully', {
              operation,
              hasQuestion: !!processedData.question,
              hasOptions: !!processedData.options,
              optionsCount: Array.isArray(processedData.options) ? processedData.options.length : 0,
              processedDataKeys: Object.keys(processedData || {}),
              questionTitle: processedData.questionTitle,
            })
          }

          // Ensure we always return valid data
          if (!processedData) {
            console.error('❌ [QUESTIONS] processedData is null/undefined, returning original data')
            return data
          }

          console.log('✅ [QUESTIONS] beforeChange completed successfully', {
            hasProcessedData: !!processedData,
            hasOptions: !!processedData.options,
            optionsCount: Array.isArray(processedData.options) ? processedData.options.length : 0,
          })
          return processedData
        } catch (error) {
          console.error('❌ [QUESTIONS] CRITICAL ERROR in beforeChange hook:', error)
          console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            dataKeys: data ? Object.keys(data) : [],
            operation,
            errorName: error instanceof Error ? error.name : typeof error,
          })

          if (req?.payload?.logger) {
            req.payload.logger.error('❌ CRITICAL ERROR in beforeChange hook for Questions:', error)
            req.payload.logger.error('Error details:', {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              dataKeys: data ? Object.keys(data) : [],
              operation,
              hasQuestion: !!data?.question,
              hasOptions: !!data?.options,
            })
          }
          // Return data as-is if there's a critical error
          // Don't throw - let Payload handle validation errors
          return data
        }
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (req?.payload?.logger) {
          req.payload.logger.info('✅ Questions afterChange hook - operation completed', {
            operation,
            questionId: doc.id,
            questionTitle: doc.questionTitle,
            optionsCount: Array.isArray(doc.options) ? doc.options.length : 0,
            hasQuestion: !!doc.question,
            hasOptions: !!doc.options,
          })
        }
        return doc
      },
    ],
    afterRead: [
      ({ doc, req }) => {
        if (req?.payload?.logger) {
          // Check for old format questions
          const hasOldFormat = doc.options?.some((opt: any) => {
            return !opt.text || (typeof opt.text === 'string' && !opt.text.root)
          })

          if (hasOldFormat) {
            req.payload.logger.warn('📌 Detected old format question', {
              questionId: doc.id,
              questionTitle: doc.questionTitle,
              optionsCount: Array.isArray(doc.options) ? doc.options.length : 0,
            })
          }
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
