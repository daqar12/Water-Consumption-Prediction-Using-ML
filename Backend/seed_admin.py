import sys
import os

# Ensure Backend imports resolve when run as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import (
    ADMIN_EMAIL,
    ADMIN_FULLNAME,
    ADMIN_PASSWORD,
    ADMIN_PHONE,
    ADMIN_USERNAME,
)
from database import SessionLocal, engine, Base
from models import User
from passwordhelper import hash_password


def seed_admin():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise RuntimeError(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the project root .env "
            "before running seed_admin.py"
        )

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()

        if existing_admin:
            print("Admin user already exists.")
            return

        hashed_pw = hash_password(ADMIN_PASSWORD)

        new_admin = User(
            username=ADMIN_USERNAME or "admin",
            fullname=ADMIN_FULLNAME or "Administrator",
            email=ADMIN_EMAIL,
            phone=ADMIN_PHONE or None,
            password=hashed_pw,
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print("Admin user created successfully!")
        print(f"Email: {ADMIN_EMAIL}")
        print("Password: (from ADMIN_PASSWORD env — not printed)")
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
