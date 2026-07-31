import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add the Backend directory to the path so it can import modules correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import User
from passwordhelper import hash_password

def seed_admin():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print("Admin user already exists.")
            return

        # Using hash_password from passwordhelper.py
        hashed_pw = hash_password(admin_password)
        
        new_admin = User(
            username="admin",
            fullname="Administrator",
            email=admin_email,
            phone="1234567890",
            password=hashed_pw,
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print("Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
