from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
import datetime

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

    customer_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    record_source = Column(
        String(20),
        nullable=False,
        default="manual",
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
        Float
    )

    october = Column(
        Float
    )

    november = Column(
        Float,
        nullable=True
    )


# System Activity Logs
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    action = Column(
        String(50),
        nullable=False,
        index=True
    )

    entity_type = Column(
        String(50),
        nullable=True
    )

    entity_id = Column(
        String(50),
        nullable=True
    )

    entity_code = Column(
        String(50),
        nullable=True,
        index=True
    )

    description = Column(
        String(500),
        nullable=True
    )

    old_data = Column(
        String(1000),
        nullable=True
    )

    new_data = Column(
        String(1000),
        nullable=True
    )

    ip_address = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        index=True
    )

    user = relationship("User", backref="activity_logs")



# make prdictions history table
class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True
    )

    meter_number = Column(
        String(50),
        nullable=True
    )

    branch = Column(
        String(100),
        nullable=False
    )

    zone = Column(
        String(100),
        nullable=False
    )

    september_consumption = Column(
        Float,
        nullable=False
    )

    october_consumption = Column(
        Float,
        nullable=False
    )

    decision_tree_prediction = Column(
        Float,
        nullable=False
    )

    gradient_boosting_prediction = Column(
        Float,
        nullable=False
    )

    linear_regression_prediction = Column(
        Float,
        nullable=False
    )

    random_forest_prediction = Column(
        Float,
        nullable=False
    )

    tuned_random_forest_prediction = Column(
        Float,
        nullable=False
    )

    tuned_xgboost_prediction = Column(
        Float,
        nullable=False
    )

    xgboost_prediction = Column(
        Float,
        nullable=False
    )

    final_prediction = Column(
        Float,
        nullable=False
    )

    prediction_status = Column(
        String(50),
        nullable=False
    )

    notes = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    # Staff/Admin user who created this prediction
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    customer = relationship("Customer", backref="predictions")
    user = relationship("User", backref="predictions")



