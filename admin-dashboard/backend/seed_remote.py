"""Seed remote Render database from local machine."""
import os
import sys

# Get the database URL from command line argument
if len(sys.argv) < 2:
    print("Usage: python seed_remote.py <DATABASE_URL>")
    print("Example: python seed_remote.py postgresql://user:pass@host/db")
    sys.exit(1)

# Set the database URL as environment variable
os.environ['DATABASE_URL'] = sys.argv[1]

# Now run the regular seed script
from seed import seed

if __name__ == "__main__":
    print(f"Connecting to remote database...")
    seed()
    print("Remote database seeded successfully!")
