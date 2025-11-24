import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create a helper function to safely convert text to jsonb for options
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION safe_text_to_jsonb_for_options(input_text text)
    RETURNS jsonb AS $$
    BEGIN
      -- If input is null or empty, return empty Lexical structure
      IF input_text IS NULL OR input_text = '' THEN
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
      END IF;

      -- Try to parse as JSON if it looks like JSON
      IF input_text ~ '^[\s]*[\{\[]' THEN
        BEGIN
          RETURN input_text::jsonb;
        EXCEPTION WHEN OTHERS THEN
          -- If parsing fails, wrap plain text in Lexical paragraph format
          RETURN jsonb_build_object(
            'root', 
            jsonb_build_object(
              'children', 
              jsonb_build_array(
                jsonb_build_object(
                  'children',
                  jsonb_build_array(
                    jsonb_build_object('text', input_text, 'type', 'text', 'format', 0, 'style', '')
                  ),
                  'type', 'paragraph',
                  'direction', 'ltr',
                  'format', '',
                  'indent', 0
                )
              ),
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
              jsonb_build_object(
                'children',
                jsonb_build_array(
                  jsonb_build_object('text', input_text, 'type', 'text', 'format', 0, 'style', '')
                ),
                'type', 'paragraph',
                'direction', 'ltr',
                'format', '',
                'indent', 0
              )
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

  // Convert text column to jsonb in questions_options table
  await db.execute(sql`
    DO $$ 
    DECLARE
      col_type text;
    BEGIN
      -- Get current column type
      SELECT data_type INTO col_type
      FROM information_schema.columns 
      WHERE table_name = 'questions_options' AND column_name = 'text';
      
      -- Only convert if not already jsonb
      IF col_type IS NOT NULL AND col_type != 'jsonb' THEN
        ALTER TABLE "questions_options" 
        ALTER COLUMN "text" TYPE jsonb 
        USING safe_text_to_jsonb_for_options("text"::text);
      END IF;
    END $$;
  `)

  // Drop the helper function
  await db.execute(sql`DROP FUNCTION IF EXISTS safe_text_to_jsonb_for_options(text);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Note: We don't revert the column type change as it would require
  // converting jsonb back to text, which may lose data structure
  // If you need to revert, you would need to extract text from jsonb structure
}

