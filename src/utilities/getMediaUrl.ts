import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * Works with both local storage and Vercel Blob Storage
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol (Vercel Blob Storage URLs or external URLs)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}${url.includes('?') ? '&' : '?'}${cacheTag}` : url
  }

  // For relative URLs (local storage), prepend client-side URL
  // On Vercel, this will use VERCEL_URL or NEXT_PUBLIC_SERVER_URL
  const baseUrl = getClientSideURL()
  
  // Ensure URL starts with / if it's a relative path
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  
  return cacheTag ? `${baseUrl}${normalizedUrl}?${cacheTag}` : `${baseUrl}${normalizedUrl}`
}
