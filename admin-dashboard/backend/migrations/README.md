# Database Migrations

This directory contains database migration scripts for the CityWatcher backend.

## Running Migrations

### Apply Migration

To apply a migration, run the migration script directly:

```bash
cd admin-dashboard/backend
python migrations/001_add_social_auth_providers.py
```

### Rollback Migration

To rollback a migration:

```bash
cd admin-dashboard/backend
python migrations/001_add_social_auth_providers.py downgrade
```

## Migration: 001_add_social_auth_providers

This migration adds support for social authentication (Google, Facebook, Apple).

### Changes:
1. Creates `social_auth_providers` table with:
   - Foreign key to `users` table
   - Unique index on `(provider, provider_user_id)`
   - Index on `(user_id, provider)`
   - Cascade delete when user is deleted

2. Updates `users` table:
   - Makes `password_hash` column nullable to support social-only accounts

### Requirements Addressed:
- 7.1: Store provider type
- 7.2: Store provider_user_id
- 7.3: Store timestamp of when social account was linked
- 4.5: Set password_hash to NULL for social-only accounts

## Notes

- The project uses SQLite with `db.create_all()` for schema management
- These migration scripts are designed to work with the existing database
- Always backup your database before running migrations
- The migration script automatically detects the database path from the `DATABASE_URL` environment variable
