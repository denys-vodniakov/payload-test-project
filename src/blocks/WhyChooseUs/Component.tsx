import React from 'react'
import type { WhyChooseUsBlock as WhyChooseUsBlockProps } from '@/payload-types'
import { WhyChooseUsClient } from './Component.client'

export const WhyChooseUsBlock: React.FC<WhyChooseUsBlockProps> = ({
  title,
  subtitle,
  description,
  features,
  layout,
  columns,
}) => {
  if (!features || features.length === 0) {
    return null
  }

  // Transform features to ensure icon and gradientColor are strings
  const transformedFeatures = features
    .filter((feature) => feature && feature.title && feature.description)
    .map((feature) => ({
      title: feature.title,
      description: feature.description,
      icon: feature.icon || 'zap',
      gradientColor: feature.gradientColor || 'blue',
      id: feature.id || undefined,
    }))

  if (transformedFeatures.length === 0) {
    return null
  }

  return (
    <WhyChooseUsClient
      title={title || 'Why Choose Us?'}
      subtitle={subtitle}
      description={description}
      features={transformedFeatures}
      layout={layout || 'grid'}
      columns={columns || 4}
    />
  )
}
