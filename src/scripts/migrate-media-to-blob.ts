// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (if exists), then .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

const result1 = dotenv.config({ path: envLocalPath, override: false })
const result2 = dotenv.config({ path: envPath, override: false })

// Debug: Check if env vars are loaded
if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.PAYLOAD_SECRET) {
  console.log('⚠️  Debug: Environment variables check:')
  console.log('   BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'SET' : 'NOT SET')
  console.log('   PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'SET' : 'NOT SET')
  console.log('   .env.local loaded:', result1.parsed ? 'YES' : 'NO')
  console.log('   .env loaded:', result2.parsed ? 'YES' : 'NO')
}

// Now import other modules
import { put } from '@vercel/blob'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { Media } from '../payload-types'

// Import config dynamically after env vars are loaded
const configPromise = import('../payload.config').then((m) => m.default)

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Migrate media files from local storage to Vercel Blob Storage
 * 
 * This script:
 * 1. Finds all media records with local URLs
 * 2. Uploads files to Vercel Blob Storage
 * 3. Updates media records with new blob URLs
 * 
 * Usage:
 *   pnpm migrate:media-to-blob
 * 
 * Required env vars:
 *   - BLOB_READ_WRITE_TOKEN: Vercel Blob Storage token
 *   - POSTGRES_URL: Database connection string
 *   - PAYLOAD_SECRET: Payload secret
 */
async function migrateMediaToBlob() {
  // Debug: Check environment variables
  console.log('🔍 Checking environment variables...')
  console.log('   BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'SET' : 'NOT SET')
  console.log('   PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'SET' : 'NOT SET')
  console.log('   POSTGRES_URL:', process.env.POSTGRES_URL ? 'SET' : 'NOT SET')
  console.log('')

  // Check if BLOB_READ_WRITE_TOKEN is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is not set')
    console.error('   Please set it in your .env file or environment variables')
    process.exit(1)
  }

  // Check if PAYLOAD_SECRET is set
  if (!process.env.PAYLOAD_SECRET) {
    console.error('❌ Error: PAYLOAD_SECRET environment variable is not set')
    console.error('   Please set it in your .env file or environment variables')
    process.exit(1)
  }

  console.log('🚀 Starting media migration to Vercel Blob Storage...\n')

  try {
    // Initialize Payload - import config dynamically to ensure env vars are loaded
    const payloadConfig = await configPromise
    const payload = await getPayload({ config: payloadConfig })
    console.log('✅ Payload initialized\n')

    // Get all media records
    const { docs: mediaRecords, totalDocs } = await payload.find({
      collection: 'media',
      limit: 1000, // Adjust if you have more than 1000 media files
      depth: 0,
    })

    console.log(`📦 Found ${totalDocs} media records\n`)

    if (totalDocs === 0) {
      console.log('✅ No media records to migrate')
      return
    }

    const localMediaDir = path.resolve(dirname, '../../public/media')
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each media record
    for (const media of mediaRecords) {
      const currentUrl = media.url

      // Skip if URL is already a blob URL (starts with https://)
      if (currentUrl?.startsWith('https://')) {
        console.log(`⏭️  Skipping ${media.filename || media.id} - already in blob storage`)
        skippedCount++
        continue
      }

      // Skip if URL is null or empty
      if (!currentUrl) {
        console.log(`⚠️  Skipping ${media.id} - no URL found`)
        skippedCount++
        continue
      }

      try {
        // Extract filename from URL
        // URL format: /api/media/file/filename.jpg or /media/filename.jpg
        const urlPath = currentUrl.startsWith('/api/media/file/')
          ? currentUrl.replace('/api/media/file/', '')
          : currentUrl.startsWith('/media/')
            ? currentUrl.replace('/media/', '')
            : currentUrl.startsWith('/')
              ? currentUrl.slice(1)
              : currentUrl

        const filename = media.filename || urlPath
        const filePath = path.join(localMediaDir, filename)

        // Check if file exists locally
        let fileBuffer: Buffer | null = null
        
        try {
          await fs.access(filePath)
          fileBuffer = await fs.readFile(filePath)
        } catch {
          console.log(`⚠️  File not found locally: ${filePath}`)
          
          // Try alternative paths
          const alternativePaths = [
            path.join(localMediaDir, urlPath),
            path.join(process.cwd(), 'public', urlPath),
            path.join(process.cwd(), 'public', 'media', urlPath),
          ]
          
          let found = false
          for (const altPath of alternativePaths) {
            try {
              await fs.access(altPath)
              fileBuffer = await fs.readFile(altPath)
              console.log(`   ✅ Found at alternative path: ${altPath}`)
              found = true
              break
            } catch {
              // Continue to next path
            }
          }
          
          // If still not found, try to fetch from server (only if server might be running)
          if (!found) {
            console.log(`   ⚠️  File not found in any local path, skipping...`)
            console.log(`   💡 Tip: Make sure file exists or start dev server to fetch via HTTP`)
            skippedCount++
            continue
          }
        }
        
        if (!fileBuffer) {
          console.log(`   ⚠️  Could not read file, skipping...`)
          skippedCount++
          continue
        }

        // Upload to Vercel Blob Storage (fileBuffer already loaded above)
        console.log(`📤 Uploading ${filename}...`)
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        })

        // Update media record with new blob URL
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            url: blob.url,
          },
        })

        console.log(`✅ Migrated: ${filename} -> ${blob.url}`)
        migratedCount++

        // Also migrate thumbnail and sizes if they exist
        if (media.thumbnailURL) {
          const thumbnailPath = path.join(localMediaDir, path.basename(media.thumbnailURL))
          try {
            await fs.access(thumbnailPath)
            const thumbnailBuffer = await fs.readFile(thumbnailPath)
            const thumbnailBlob = await put(`thumbnails/${filename}`, thumbnailBuffer, {
              access: 'public',
              token: process.env.BLOB_READ_WRITE_TOKEN!,
            })
            
            await payload.update({
              collection: 'media',
              id: media.id,
              data: {
                thumbnailURL: thumbnailBlob.url,
              },
            })
            console.log(`   ✅ Migrated thumbnail: ${path.basename(media.thumbnailURL)}`)
          } catch {
            // Thumbnail might be generated on-the-fly, skip
          }
        }

        // Migrate image sizes if they exist
        if (media.sizes) {
          const sizeUpdates: Partial<Media['sizes']> = {}
          let hasSizeUpdates = false

          for (const [sizeName, sizeData] of Object.entries(media.sizes)) {
            if (sizeData?.url && !sizeData.url.startsWith('https://')) {
              const sizePath = path.join(localMediaDir, path.basename(sizeData.url))
              try {
                await fs.access(sizePath)
                const sizeBuffer = await fs.readFile(sizePath)
                const sizeBlob = await put(`sizes/${sizeName}-${filename}`, sizeBuffer, {
                  access: 'public',
                  token: process.env.BLOB_READ_WRITE_TOKEN!,
                })
                
                sizeUpdates[sizeName as keyof typeof sizeUpdates] = {
                  ...sizeData,
                  url: sizeBlob.url,
                }
                hasSizeUpdates = true
                console.log(`   ✅ Migrated size ${sizeName}: ${path.basename(sizeData.url)}`)
              } catch {
                // Size might be generated on-the-fly, skip
              }
            }
          }

          if (hasSizeUpdates) {
            await payload.update({
              collection: 'media',
              id: media.id,
              data: {
                sizes: {
                  ...media.sizes,
                  ...sizeUpdates,
                },
              },
            })
          }
        }
      } catch (error) {
        console.error(`❌ Error migrating ${media.filename || media.id}:`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Migrated: ${migratedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log('='.repeat(50))

    if (errorCount > 0) {
      console.log('\n⚠️  Some files failed to migrate. Please check the errors above.')
      process.exit(1)
    } else {
      console.log('\n✅ Migration completed successfully!')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateMediaToBlob()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

