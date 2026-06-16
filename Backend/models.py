from sqlalchemy import (
    Column,
    Integer,
    String
)

from database import Base


# System Users (Login Accounts)
class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        nullable=False
    )

    fullname = Column(
        String(150),
        unique=True,
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    phone = Column(
        String(20)
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        default="staff"
    )

# Customers (Water Usage Data)
class Customer(Base):
    __tablename__ = "customers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    Customer_Name = Column(
        String(150),
        nullable=False
    )

  

    Branch = Column(
        String(100)
    )

    Zone = Column(
        String(100)
    )

    september = Column(
        Integer
    )

    october = Column(
        Integer
    )

    november = Column(
        Integer
    )



