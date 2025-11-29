import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Rename enum type from enum_footer_nav_items_link_type to enum_footer_nav_blocks_links_link_type
  await db.execute(sql`
    DO $$ 
    BEGIN
      -- Check if old enum exists and new enum doesn't exist
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_footer_nav_items_link_type'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_footer_nav_blocks_links_link_type'
      ) THEN
        -- Rename the enum type
        ALTER TYPE "public"."enum_footer_nav_items_link_type" 
        RENAME TO "enum_footer_nav_blocks_links_link_type";
      END IF;
    END $$;
  `)

  // Step 2: Drop old table if it exists (Payload will create new structure)
  // This allows Payload to create the new table structure without conflicts
  await db.execute(sql`
    DROP TABLE IF EXISTS "footer_nav_items" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Rename enum type back from enum_footer_nav_blocks_links_link_type to enum_footer_nav_items_link_type
  await db.execute(sql`
    DO $$ 
    BEGIN
      -- Check if new enum exists and old enum doesn't exist
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_footer_nav_blocks_links_link_type'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_footer_nav_items_link_type'
      ) THEN
        -- Rename the enum type back
        ALTER TYPE "public"."enum_footer_nav_blocks_links_link_type" 
        RENAME TO "enum_footer_nav_items_link_type";
      END IF;
    END $$;
  `)
}
