"""
Migration: Add social_auth_providers table and update users table

This migration:
1. Creates the social_auth_providers table with proper indexes and foreign keys
2. Makes the password_hash column nullable in the users table to support social-only accounts

Requirements: 7.1, 7.2, 7.3, 4.5
"""

import sqlite3
import os
from datetime import datetime


def get_db_path():
    """Get the database path from environment or use default."""
    db_url = os.getenv('DATABASE_URL', 'sqlite:///citywatcher.db')
    # Extract path from SQLite URL
    if db_url.startswith('sqlite:///'):
        path = db_url.replace('sqlite:///', '')
        # If path is relative, check common locations
        if not os.path.isabs(path):
            # Try instance directory first
            instance_path = os.path.join('instance', path)
            if os.path.exists(instance_path):
                return instance_path
            # Try current directory
            if os.path.exists(path):
                return path
        return path
    return 'instance/citywatcher.db'


def upgrade():
    """Apply the migration."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting migration: Add social_auth_providers table")
        
        # Create social_auth_providers table
        print("Creating social_auth_providers table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS social_auth_providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider VARCHAR(20) NOT NULL,
                provider_user_id VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                profile_picture_url VARCHAR(500),
                created_at DATETIME,
                updated_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        
        # Create unique index on provider + provider_user_id
        print("Creating idx_provider_user index...")
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_user 
            ON social_auth_providers (provider, provider_user_id)
        """)
        
        # Create index on user_id + provider
        print("Creating idx_user_provider index...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_provider 
            ON social_auth_providers (user_id, provider)
        """)
        
        # Make password_hash nullable in users table
        # SQLite doesn't support ALTER COLUMN directly, so we need to:
        # 1. Create a new table with the updated schema
        # 2. Copy data from old table
        # 3. Drop old table
        # 4. Rename new table
        
        print("Updating users table to make password_hash nullable...")
        
        # Check if password_hash is already nullable
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        password_hash_col = next((col for col in columns if col[1] == 'password_hash'), None)
        
        if password_hash_col and password_hash_col[3] == 1:  # notnull = 1 means NOT NULL
            print("Making password_hash nullable...")
            
            # Get the current table schema
            cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
            create_table_sql = cursor.fetchone()[0]
            
            # Create temporary table with nullable password_hash
            cursor.execute("""
                CREATE TABLE users_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255),
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'field_worker',
                    department VARCHAR(100),
                    municipality_id INTEGER,
                    phone VARCHAR(20),
                    is_active BOOLEAN DEFAULT 1,
                    last_login DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME,
                    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
                )
            """)
            
            # Copy data from old table to new table
            cursor.execute("""
                INSERT INTO users_new 
                SELECT * FROM users
            """)
            
            # Recreate indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_user_municipality_role 
                ON users_new (municipality_id, role)
            """)
            
            # Drop old table
            cursor.execute("DROP TABLE users")
            
            # Rename new table
            cursor.execute("ALTER TABLE users_new RENAME TO users")
            
            print("password_hash is now nullable")
        else:
            print("password_hash is already nullable, skipping...")
        
        conn.commit()
        print("Migration completed successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {str(e)}")
        return False
        
    finally:
        conn.close()


def downgrade():
    """Rollback the migration."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting rollback: Remove social_auth_providers table")
        
        # Drop indexes
        print("Dropping indexes...")
        cursor.execute("DROP INDEX IF EXISTS idx_provider_user")
        cursor.execute("DROP INDEX IF EXISTS idx_user_provider")
        
        # Drop table
        print("Dropping social_auth_providers table...")
        cursor.execute("DROP TABLE IF EXISTS social_auth_providers")
        
        # Note: We don't revert password_hash to NOT NULL as it may break existing data
        print("Note: password_hash column remains nullable to preserve data integrity")
        
        conn.commit()
        print("Rollback completed successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Rollback failed: {str(e)}")
        return False
        
    finally:
        conn.close()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'downgrade':
        downgrade()
    else:
        upgrade()
