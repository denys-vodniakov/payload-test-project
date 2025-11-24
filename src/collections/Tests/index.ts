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
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Log to console for immediate visibility
        console.log('🔍 [TESTS] beforeValidate hook called', {
          operation,
          hasData: !!data,
          hasQuestions: !!data?.questions,
          questionsType: Array.isArray(data?.questions) ? 'array' : typeof data?.questions,
          questionsCount: Array.isArray(data?.questions) ? data.questions.length : 0,
          testId: data?.id || 'new',
          testTitle: data?.title,
          dataKeys: data ? Object.keys(data) : [],
        })

        if (req?.payload?.logger) {
          req.payload.logger.info('🔍 Tests beforeValidate hook called', {
            operation,
            hasData: !!data,
            hasQuestions: !!data?.questions,
            questionsType: Array.isArray(data?.questions) ? 'array' : typeof data?.questions,
            questionsCount: Array.isArray(data?.questions) ? data.questions.length : 0,
            testId: data?.id || 'new',
            testTitle: data?.title,
          })
        }

        if (operation === 'create' || operation === 'update') {
          // Handle different data formats for relationship fields
          const questions = data?.questions

          // Check if questions is empty or undefined
          if (!questions) {
            console.error('❌ [TESTS] beforeValidate: no questions provided')
            if (req?.payload?.logger) {
              req.payload.logger.error('❌ Tests validation failed: no questions provided')
            }
            throw new Error('You must add at least one question to the test')
          }

          // Check if it's an array and has items
          if (Array.isArray(questions)) {
            // Filter out null or undefined values
            const validQuestions = questions.filter((q) => q !== null && q !== undefined)
            if (validQuestions.length === 0) {
              console.error('❌ [TESTS] beforeValidate: all questions are null/undefined', {
                originalCount: questions.length,
                validCount: validQuestions.length,
              })
              if (req?.payload?.logger) {
                req.payload.logger.error(
                  '❌ Tests validation failed: all questions are null/undefined',
                  {
                    originalCount: questions.length,
                    validCount: validQuestions.length,
                  },
                )
              }
              throw new Error('You must add at least one question to the test')
            }

            console.log('✅ [TESTS] beforeValidate passed', {
              totalQuestions: questions.length,
              validQuestions: validQuestions.length,
            })

            if (req?.payload?.logger) {
              req.payload.logger.info('✅ Tests validation passed', {
                totalQuestions: questions.length,
                validQuestions: validQuestions.length,
              })
            }
          } else {
            console.warn('⚠️ [TESTS] beforeValidate: questions is not an array', {
              questionsType: typeof questions,
              questions,
            })
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        console.log('📝 [TESTS] beforeChange hook called', {
          operation,
          testId: data?.id || 'new',
          testTitle: data?.title,
          hasQuestions: !!data?.questions,
          questionsCount: Array.isArray(data?.questions) ? data.questions.length : 0,
          dataKeys: data ? Object.keys(data) : [],
        })

        if (req?.payload?.logger) {
          req.payload.logger.info('📝 Tests beforeChange hook called', {
            operation,
            testId: data?.id || 'new',
            testTitle: data?.title,
            hasQuestions: !!data?.questions,
            questionsCount: Array.isArray(data?.questions) ? data.questions.length : 0,
          })
        }

        try {
          console.log('✅ [TESTS] beforeChange completed successfully')
          return data
        } catch (error) {
          console.error('❌ [TESTS] ERROR in beforeChange hook:', error)
          if (req?.payload?.logger) {
            req.payload.logger.error('❌ Tests beforeChange error:', error)
          }
          throw error
        }
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        console.log('✅ [TESTS] afterChange hook - operation completed', {
          operation,
          testId: doc.id,
          testTitle: doc.title,
          questionsCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
          hasQuestions: !!doc.questions,
        })

        if (req?.payload?.logger) {
          req.payload.logger.info('✅ Tests afterChange hook - operation completed', {
            operation,
            testId: doc.id,
            testTitle: doc.title,
            questionsCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
          })
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
