import { sqlQuery } from './db';

declare global {
  // eslint-disable-next-line no-var
  var __mwaEventsSchemaEnsured: boolean | undefined;
}

export async function ensureEventsSchema() {
  if (globalThis.__mwaEventsSchemaEnsured) return;

  // Events table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS events (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      event_date DATE NOT NULL,
      event_time TIME NOT NULL,
      timezone VARCHAR(50) NOT NULL DEFAULT 'EST',
      image_url VARCHAR(1024) NULL,
      category VARCHAR(100) NULL,
      is_platform_hosted BOOLEAN NOT NULL DEFAULT true,
      external_url VARCHAR(1024) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Event reservations table
  await sqlQuery(`
    CREATE TABLE IF NOT EXISTS event_reservations (
      id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id CHAR(36) NOT NULL,
      event_id CHAR(36) NOT NULL,
      reserved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE (user_id, event_id)
    )
  `);

  // Create indexes
  try {
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_event_reservations_user_id ON event_reservations(user_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_event_reservations_event_id ON event_reservations(event_id)`);
    await sqlQuery(`CREATE INDEX IF NOT EXISTS idx_event_reservations_user_event ON event_reservations(user_id, event_id)`);
  } catch (err: any) {
    // Indexes might already exist
    console.warn('Error creating event indexes:', err);
  }

  // Create trigger for events updated_at
  try {
    await sqlQuery(`
      DROP TRIGGER IF EXISTS update_events_updated_at ON events
    `);
    await sqlQuery(`
      CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
  } catch (err: any) {
    console.warn('Error creating events updated_at trigger:', err);
  }

  // Insert the Crypto Clarity event
  try {
    await sqlQuery(
      `INSERT INTO events (id, title, slug, description, event_date, event_time, timezone, category, is_platform_hosted)
       VALUES (
         'crypto-clarity-2026-01-04',
         'Crypto Clarity',
         'crypto-clarity-2026-01-04',
         'Institutions aren''t speculating anymore. They''re building. The question is: do you understand what''s happening, or are you still watching from the sidelines?',
         '2026-01-04',
         '19:00:00',
         'EST',
         'Workshop',
         true
       )
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         event_date = EXCLUDED.event_date,
         event_time = EXCLUDED.event_time,
         timezone = EXCLUDED.timezone,
         category = EXCLUDED.category,
         updated_at = CURRENT_TIMESTAMP`
    );
  } catch (err: any) {
    console.warn('Error inserting Crypto Clarity event:', err);
  }

  globalThis.__mwaEventsSchemaEnsured = true;
}
