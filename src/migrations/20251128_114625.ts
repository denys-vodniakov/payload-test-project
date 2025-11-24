import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add question_title column if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'question_title'
      ) THEN
        ALTER TABLE "questions" ADD COLUMN "question_title" varchar DEFAULT 'Untitled Question';
      END IF;
    END $$;
  `)

  // Create a helper function to safely convert to jsonb
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION safe_text_to_jsonb(input_text text)
    RETURNS jsonb AS $$
    BEGIN
      -- Try to parse as JSON if it looks like JSON
      IF input_text ~ '^[\s]*[\{\[]' THEN
        BEGIN
          RETURN input_text::jsonb;
        EXCEPTION WHEN OTHERS THEN
          -- If parsing fails, return empty Lexical structure
          RETURN jsonb_build_object(
            'root', 
            jsonb_build_object(
              'children', 
              jsonb_build_array(),
              'type', 'root',
              'direction', 'ltr',
              'format', '',
              'indent', 0,
              'version', 1
            )
          );
        END;
      ELSE
        -- Wrap plain text in Lexical paragraph format
        RETURN jsonb_build_object(
          'root', 
          jsonb_build_object(
            'children', 
            jsonb_build_array(
              jsonb_build_object('text', input_text, 'type', 'paragraph')
            ),
            'type', 'root',
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'version', 1
          )
        );
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Convert question column to jsonb if it's not already jsonb
  await db.execute(sql`
    DO $$ 
    DECLARE
      col_type text;
    BEGIN
      -- Get current column type
      SELECT data_type INTO col_type
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'question';
      
      -- Only convert if not already jsonb
      IF col_type IS NOT NULL AND col_type != 'jsonb' THEN
        ALTER TABLE "questions" 
        ALTER COLUMN "question" TYPE jsonb 
        USING safe_text_to_jsonb(question::text);
      END IF;
    END $$;
  `)

  // Drop the helper function
  await db.execute(sql`DROP FUNCTION IF EXISTS safe_text_to_jsonb(text);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove question_title column if it exists
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'question_title'
      ) THEN
        ALTER TABLE "questions" DROP COLUMN "question_title";
      END IF;
    END $$;
  `)

  // Note: We don't revert question column type change as it would require
  // converting jsonb back to text, which may lose data structure
}
