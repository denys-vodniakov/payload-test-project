// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (if exists), then .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

dotenv.config({ path: envLocalPath, override: false })
dotenv.config({ path: envPath, override: false })

// Now import other modules
import { getPayload } from 'payload'

// Import config dynamically after env vars are loaded
const configPromise = import('../payload.config').then((m) => m.default)

/**
 * Check media URLs in database
 * Shows which files are using local URLs vs Blob Storage URLs
 */
async function checkMediaUrls() {
  console.log('🔍 Checking media URLs in database...\n')

  try {
    // Initialize Payload - import config dynamically to ensure env vars are loaded
    const payloadConfig = await configPromise
    const payload = await getPayload({ config: payloadConfig })
    console.log('✅ Payload initialized\n')

    // Get all media records (bypass cache)
    const { docs: mediaRecords, totalDocs } = await payload.find({
      collection: 'media',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    console.log(`📦 Found ${totalDocs} media records\n`)
    console.log('='.repeat(80))

    let blobCount = 0
    let localCount = 0
    let emptyCount = 0

    for (const media of mediaRecords) {
      const url = media.url
      const filename = media.filename || media.id

      if (!url) {
        console.log(`⚠️  ${filename}: NO URL`)
        emptyCount++
        continue
      }

      if (url.startsWith('https://')) {
        console.log(`✅ ${filename}:`)
        console.log(`   URL: ${url}`)
        console.log(`   Type: Blob Storage`)
        blobCount++
      } else {
        console.log(`❌ ${filename}:`)
        console.log(`   URL: ${url}`)
        console.log(`   Type: Local storage`)
        console.log(`   ⚠️  This file should be migrated or re-uploaded`)
        localCount++
      }
      console.log('')
    }

    console.log('='.repeat(80))
    console.log('📊 Summary:')
    console.log(`   ✅ Blob Storage URLs: ${blobCount}`)
    console.log(`   ❌ Local URLs: ${localCount}`)
    console.log(`   ⚠️  Empty URLs: ${emptyCount}`)
    console.log('='.repeat(80))

    // Check header logo
    console.log('\n🔍 Checking Header logo configuration...\n')
    const headerData = await payload.findGlobal({
      slug: 'header',
      depth: 2,
    })

    if (headerData.logo) {
      console.log('Header Logo Configuration:')
      
      if (headerData.logo.light) {
        const lightLogo = typeof headerData.logo.light === 'object' ? headerData.logo.light : null
        if (lightLogo) {
          const url = lightLogo.url || 'NO URL'
          const type = url.startsWith('https://') ? '✅ Blob Storage' : '❌ Local'
          console.log(`   Light logo: ${type}`)
          console.log(`   URL: ${url}`)
        }
      }

      if (headerData.logo.dark) {
        const darkLogo = typeof headerData.logo.dark === 'object' ? headerData.logo.dark : null
        if (darkLogo) {
          const url = darkLogo.url || 'NO URL'
          const type = url.startsWith('https://') ? '✅ Blob Storage' : '❌ Local'
          console.log(`   Dark logo: ${type}`)
          console.log(`   URL: ${url}`)
        }
      }

      if (headerData.logo.mobile) {
        const mobileLogo = typeof headerData.logo.mobile === 'object' ? headerData.logo.mobile : null
        if (mobileLogo) {
          const url = mobileLogo.url || 'NO URL'
          const type = url.startsWith('https://') ? '✅ Blob Storage' : '❌ Local'
          console.log(`   Mobile logo: ${type}`)
          console.log(`   URL: ${url}`)
        }
      }
    } else {
      console.log('   No logo configured in header')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run check
checkMediaUrls()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

