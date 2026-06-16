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