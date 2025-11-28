import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'group',
      label: 'Логотип',
      fields: [
        {
          name: 'light',
          type: 'upload',
          relationTo: 'media',
          label: 'Логотип для светлой темы',
          admin: {
            description: 'Логотип, который будет отображаться на светлом фоне',
          },
        },
        {
          name: 'dark',
          type: 'upload',
          relationTo: 'media',
          label: 'Логотип для темной темы',
          admin: {
            description: 'Логотип, который будет отображаться на темном фоне',
          },
        },
        {
          name: 'mobile',
          type: 'upload',
          relationTo: 'media',
          label: 'Логотип для мобильных устройств (опционально)',
          admin: {
            description:
              'Опциональный логотип для мобильных устройств. Если не указан, будет использоваться логотип светлой темы',
          },
          required: false,
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
