// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (if exists), then .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

dotenv.config({ path: envLocalPath, override: false })
dotenv.config({ path: envPath, override: false })

// Now import other modules
import { list } from '@vercel/blob'
import { getPayload } from 'payload'

// Import config dynamically after env vars are loaded
const configPromise = import('../payload.config').then((m) => m.default)

/**
 * Fix media URLs by matching files in Blob Storage with database records
 * This script finds files that exist in Blob Storage but have local URLs in database
 */
async function fixMediaUrlsFromBlob() {
  // Check if BLOB_READ_WRITE_TOKEN is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is not set')
    console.error('   Please set it in your .env.local file')
    process.exit(1)
  }

  console.log('🔍 Fixing media URLs from Blob Storage...\n')

  try {
    // Initialize Payload
    const payloadConfig = await configPromise
    const payload = await getPayload({ config: payloadConfig })
    console.log('✅ Payload initialized\n')

    // List all files in Blob Storage
    console.log('📦 Fetching files from Blob Storage...')
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    })
    console.log(`✅ Found ${blobs.length} files in Blob Storage\n`)

    // Create a map of filename -> blob URL
    const blobMap = new Map<string, string>()
    for (const blob of blobs) {
      // Extract filename from pathname (remove prefixes like "sizes/", "thumbnails/")
      const filename = blob.pathname.split('/').pop() || blob.pathname
      // Decode URL-encoded filename
      const decodedFilename = decodeURIComponent(filename)
      
      // Store the main file URL (not thumbnails or sizes)
      if (!blob.pathname.includes('/') && !blob.pathname.includes('thumbnails') && !blob.pathname.includes('sizes')) {
        blobMap.set(decodedFilename, blob.url)
        // Also store with URL-encoded version
        blobMap.set(filename, blob.url)
      }
    }

    console.log(`📋 Created map of ${blobMap.size} files\n`)

    // Get all media records
    const { docs: mediaRecords, totalDocs } = await payload.find({
      collection: 'media',
      limit: 1000,
      depth: 0,
    })

    console.log(`📦 Found ${totalDocs} media records in database\n`)
    console.log('='.repeat(80))

    let fixedCount = 0
    let skippedCount = 0
    let notFoundCount = 0

    for (const media of mediaRecords) {
      const currentUrl = media.url
      const filename = media.filename || ''

      // Skip if already using blob URL
      if (currentUrl?.startsWith('https://')) {
        console.log(`⏭️  Skipping ${filename} - already using Blob Storage`)
        skippedCount++
        continue
      }

      // Skip if no URL
      if (!currentUrl || !filename) {
        console.log(`⚠️  Skipping ${media.id} - no URL or filename`)
        skippedCount++
        continue
      }

      // Try to find matching blob
      let blobUrl: string | undefined

      // Try exact filename match
      blobUrl = blobMap.get(filename)

      // Try URL-decoded filename
      if (!blobUrl) {
        blobUrl = blobMap.get(decodeURIComponent(filename))
      }

      // Try extracting filename from URL path
      if (!blobUrl && currentUrl.includes('/')) {
        const urlFilename = currentUrl.split('/').pop() || ''
        blobUrl = blobMap.get(urlFilename)
        if (!blobUrl) {
          blobUrl = blobMap.get(decodeURIComponent(urlFilename))
        }
      }

      if (blobUrl) {
        // Update media record with blob URL
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            url: blobUrl,
          },
        })

        console.log(`✅ Fixed: ${filename}`)
        console.log(`   Old: ${currentUrl}`)
        console.log(`   New: ${blobUrl}`)
        fixedCount++
      } else {
        console.log(`❌ Not found in Blob Storage: ${filename}`)
        console.log(`   Current URL: ${currentUrl}`)
        notFoundCount++
      }
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('📊 Summary:')
    console.log(`   ✅ Fixed: ${fixedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Not found: ${notFoundCount}`)
    console.log('='.repeat(80))

    if (fixedCount > 0) {
      console.log('\n✅ URLs updated successfully!')
      console.log('💡 You may need to restart your dev server to see the changes.')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run fix
fixMediaUrlsFromBlob()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

