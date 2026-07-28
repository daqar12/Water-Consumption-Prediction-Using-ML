from typing import Optional
from datetime import datetime
import math
import re

from pydantic import BaseModel, ConfigDict, field_validator


class UserCreate(BaseModel):
    username: str
    fullname: str
    email: str
    phone: str
    password: str


class UserUpdate(BaseModel):
    fullname: str
    phone: str
    email: str
    password: Optional[str] = None

    @field_validator("fullname")
    @classmethod
    def validate_fullname(cls, v: str) -> str:
        name = (v or "").strip()
        if not name:
            raise ValueError("Full name is required.")
        if len(name) < 3:
            raise ValueError("Full name must be at least 3 characters.")
        if len(name) > 100:
            raise ValueError("Full name must be at most 100 characters.")
        return name

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        phone = (v or "").strip()
        if not phone:
            raise ValueError("Phone number is required.")
        if not re.match(r"^\+?[0-9\s\-()]{7,20}$", phone):
            raise ValueError("Invalid phone number format.")
        digits = re.sub(r"\D", "", phone)
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Invalid phone number format.")
        return phone

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        email = (v or "").strip()
        if not email:
            raise ValueError("Email address is required.")
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
            raise ValueError("Invalid email format.")
        if len(email) > 150:
            raise ValueError("Email address is too long.")
        return email

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        password = v.strip() if isinstance(v, str) else ""
        if password == "":
            return None
        if len(password) < 8:
            raise ValueError("Password must contain at least 8 characters.")
        return password


class UserResponse(BaseModel):
    id: int
    username: str
    fullname: str
    phone: Optional[str] = None
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class CustomerCreate(BaseModel):
    Customer_Name: str
    Branch: str
    Zone: str
    september: int
    october: int
    november: int

#prediction_history
class PredictionHistoryCreate(BaseModel):
    September: float
    October: float
    Branch: str
    Zone: str
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    meter_number: Optional[str] = None

    @field_validator("September", "October")
    @classmethod
    def validate_consumption(cls, v: float, info) -> float:
        field_name = "September" if info.field_name == "September" else "October"
        MIN_CONSUMPTION = 0.5
        MAX_CONSUMPTION = 100000

        # Must be a finite number (reject NaN, Infinity)
        if not math.isfinite(v):
            raise ValueError(f"{field_name} consumption must be a finite number.")

        # Minimum allowed consumption is 0.5 m³ (rejects 0 and any value below 0.5)
        if v < MIN_CONSUMPTION:
            raise ValueError("Water consumption must be at least 0.5 m\u00b3.")

        # Must not exceed maximum
        if v > MAX_CONSUMPTION:
            raise ValueError(
                f"{field_name} consumption must be between {MIN_CONSUMPTION} and 100,000 m\u00b3."
            )

        # Maximum 2 decimal places
        if round(v, 2) != v:
            raise ValueError(f"{field_name} consumption allows a maximum of 2 decimal places.")

        return round(v, 2)

class PredictionHistoryResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    meter_number: Optional[str] = None
    branch: str
    zone: str
    september_consumption: float
    october_consumption: float
    decision_tree_prediction: float
    gradient_boosting_prediction: float
    linear_regression_prediction: float
    random_forest_prediction: float
    tuned_random_forest_prediction: float
    tuned_xgboost_prediction: float
    xgboost_prediction: float
    final_prediction: float
    prediction_status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Creator (staff/admin who generated the prediction)
    user_id: Optional[int] = None
    user_fullname: Optional[str] = None

    # Fields mapped for frontend compatibility
    previous: float
    current: float
    consumption: float
    ml_predicted: float
    variance: float
    status: str
    read_date: str
    reader: str

    model_config = ConfigDict(from_attributes=True)
    