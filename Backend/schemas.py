from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    fullname: str
    email: str
    phone: str
    password: str


class CustomerCreate(BaseModel):
    Customer_Name: str
    Branch: str
    Zone: str
    september: int
    october: int
    november: int

from typing import Optional
from datetime import datetime
from pydantic import ConfigDict

#prediction_history
class PredictionHistoryCreate(BaseModel):
    September: float
    October: float
    Branch: str
    Zone: str
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    meter_number: Optional[str] = None

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
    