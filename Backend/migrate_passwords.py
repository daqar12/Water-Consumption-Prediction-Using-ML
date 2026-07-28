"""
Password Migration Script
=========================
Scans every user in the `users` table and converts plain-text passwords
to bcrypt hashes.  Already-hashed passwords are left untouched.

Safe to run multiple times (idempotent).
"""

import re
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from passwordhelper import hash_password

# A valid bcrypt hash starts with $2a$, $2b$, or $2y$ and is exactly 60 chars
BCRYPT_PATTERN = re.compile(r"^\$2[aby]\$\d{2}\$.{53}$")


def is_bcrypt_hash(value: str) -> bool:
    """Return True if the value looks like a valid bcrypt hash."""
    return bool(BCRYPT_PATTERN.match(value)) and len(value) == 60


def migrate_passwords():
    db: Session = SessionLocal()

    try:
        users = db.query(User).order_by(User.id).all()

        total_scanned = 0
        already_hashed = 0
        converted = 0
        errors = 0

        print("=" * 60)
        print("  PASSWORD MIGRATION -- START")
        print("=" * 60)

        for user in users:
            total_scanned += 1

            try:
                if is_bcrypt_hash(user.password):
                    already_hashed += 1
                    print(f"  [SKIP]    id={user.id}  email={user.email}  -- already hashed")
                else:
                    hashed = hash_password(user.password)
                    user.password = hashed
                    converted += 1
                    print(f"  [HASHED]  id={user.id}  email={user.email}  -- plain text -> bcrypt")
            except Exception as e:
                errors += 1
                print(f"  [ERROR]   id={user.id}  email={user.email}  -- {e}")

        # Commit all changes in a single transaction
        db.commit()

        print("=" * 60)
        print("  MIGRATION SUMMARY")
        print("=" * 60)
        print(f"  Total users scanned  : {total_scanned}")
        print(f"  Already hashed       : {already_hashed}")
        print(f"  Converted to bcrypt  : {converted}")
        print(f"  Errors               : {errors}")
        print("=" * 60)

        if errors > 0:
            print("\n  [!] Some records had errors. Review the log above.")
            sys.exit(1)
        else:
            print("\n  [OK] Migration completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"\n  [FAIL] Migration failed: {e}")
        sys.exit(1)

    finally:
        db.close()


if __name__ == "__main__":
    migrate_passwords()
