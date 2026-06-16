from fastapi import (
    FastAPI,
    Depends,
    File,
    HTTPException,
    UploadFile
)

import pandas as pd
from sqlalchemy.orm import Session

from database import (
    engine,
    Base,
    get_db
)

from models import Customer, User
import schemas
import crud
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(
    bind=engine
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

import secrets

# simple in-memory store (swap for Redis/DB in production)
active_sessions: dict[str, dict] = {}

@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data["email"]).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email")
    if user.password != data["password"]:
        raise HTTPException(status_code=401, detail="Invalid password")

    token = secrets.token_hex(32)
    active_sessions[token] = {"id": user.id, "email": user.email, "role": user.role}

    return {
        "message": "Login successful",
        "session_token": token,          # ← frontend reads this
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "fullname": user.fullname,
            "username": user.username,
            "phone": user.phone
        },
    }

@app.post("/logout")
def logout(data: dict):
    token = data.get("token")
    active_sessions.pop(token, None)     # invalidate server-side
    return {"message": "Logout successful"}

# @app.post("/login")
# def login(data: dict, db: Session = Depends(get_db)):

#     user = (
#         db.query(User)
#         .filter(User.email == data["email"])
#         .first()
#     )

#     if not user:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email"
#         )

#     if user.password != data["password"]:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid password"
#         )

#     return {
#         "message": "Login successful",
#         "user": {
#             "id": user.id,
#             "email": user.email,
#             "role": user.role
#         }
#     }

# #logout
# @app.post("/logout")
# def logout():
#     return {
#         "message": "Logout successful"
#     }   

@app.post("/users")
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    return crud.create_user(
        db,
        user
    )

@app.get("/users")
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@app.get("/users/all")
def get_all_users_count(db: Session = Depends(get_db)):
    total = db.query(User).count()
    return {"total": total}


@app.post("/customers")
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    return crud.create_customer(
        db,
        customer
    )

# @app.get("/customers/all")
# def get_customers(
#     db: Session = Depends(get_db)
# ):
#     return db.query(Customer).all()

@app.get("/customers/all")
def get_all_customers_count(db: Session = Depends(get_db)):
    total = db.query(Customer).count()
    return {"total": total}

@app.get("/customers/overview")
def get_customers_overview(db: Session = Depends(get_db)):
    from sqlalchemy import func
    results = (
        db.query(Customer.Branch, func.count(Customer.id).label("total"))
        .group_by(Customer.Branch)
        .all()
    )
    return [
        {"name": row.Branch, "total": row.total} 
        for row in results 
        if row.Branch and str(row.Branch).strip().lower() not in ("nan", "null", "none")
    ]

@app.get("/customers")
def get_customers(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    total = db.query(Customer).count()
    offset = (page - 1) * limit
    customers = db.query(Customer).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "data": customers
    }


@app.post("/customers/upload")
async def upload_customers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    try:

        if file.filename.endswith(".csv"):

            df = pd.read_csv(
                file.file
            )

        elif file.filename.endswith(".xlsx"):

            df = pd.read_excel(
                file.file
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Only CSV or XLSX allowed"
            )


        inserted = []


        for _, row in df.iterrows():

            customer = Customer(
        Customer_Name=str(row["Customer Name"]),
        Branch=str(row["Branch"]),
        Zone=str(row["Zone"]),
        september=int(row["September"]) if pd.notna(row["September"]) else 0,
        october=int(row["October"])     if pd.notna(row["October"])    else 0,
        november=int(row["November"])   if pd.notna(row["November"])   else 0,
    )

            db.add(
                customer
            )

            inserted.append(
                customer
            )



        db.commit()

        return {
            "message":
            f"{len(inserted)} customers uploaded"
        }


    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )