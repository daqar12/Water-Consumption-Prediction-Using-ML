from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

try:
    from config import DATABASE_URL
except Exception:
    DATABASE_URL = "postgresql://postgres:12345@localhost:5432/WBP_DB"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
