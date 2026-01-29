import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TestPageClient } from './TestPageClient'
import { getServerSideURL } from '@/utilities/getURL'
import type { Media } from '@/payload-types'

interface Props {
  params: Promise<{ id: string }>
}

// Generate static paths for popular tests (optional optimization)
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  
  const tests = await payload.find({
    collection: 'tests',
    where: { isActive: { equals: true } },
    limit: 20,
  })

  return tests.docs.map((test) => ({
    id: String(test.id),
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const test = await payload.findByID({
    collection: 'tests',
    id,
    depth: 1,
  }).catch(() => null)

  if (!test) {
    return { title: 'Test Not Found' }
  }

  const meta = test.meta as {
    title?: string | null
    description?: string | null
    keywords?: string | null
    image?: Media | number | null
    noIndex?: boolean | null
  } | null

  // Build title
  const title = meta?.title || `${test.title} | Test`
  
  // Build description
  const description = meta?.description || test.description || `Take the ${test.title} test and check your knowledge`
  
  // Build image URL for OpenGraph
  let ogImage: string | undefined
  if (meta?.image && typeof meta.image === 'object' && 'url' in meta.image) {
    ogImage = meta.image.url?.startsWith('http') 
      ? meta.image.url 
      : `${getServerSideURL()}${meta.image.url}`
  }

  // Build keywords array
  const keywords = meta?.keywords?.split(',').map(k => k.trim()).filter(Boolean)

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    robots: meta?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function TestPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch test data on the server
  const test = await payload.findByID({
    collection: 'tests',
    id,
    depth: 2,
  }).catch(() => null)

  if (!test || !test.isActive) {
    notFound()
  }

  // Transform questions data
  const questions = (test.questions || []).map((q: any) => {
    const questionData = typeof q === 'object' ? q : null
    if (!questionData) return null

    return {
      id: String(questionData.id),
      question: questionData.question,
      options: (questionData.options || []).map((opt: any) => ({
        text: opt.text,
        isCorrect: opt.isCorrect || false,
      })),
      explanation: questionData.explanation,
      answerFeedback: questionData.answerFeedback,
    }
  }).filter(Boolean)

  const testData = {
    id: String(test.id),
    title: test.title,
    description: test.description || '',
    category: typeof test.category === 'object' && test.category !== null ? (test.category as any).name : test.category || 'General',
    difficulty: test.difficulty || 'medium',
    timeLimit: test.timeLimit ?? undefined,
    questions: questions.filter((q): q is NonNullable<typeof q> => q !== null),
  }

  return <TestPageClient initialTest={testData} initialQuestions={testData.questions} />
}
