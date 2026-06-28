from models import PredictionHistory, User, Customer
from passwordhelper import hash_password


def create_user(db, user):

    item = User(
        username=user.username,
        fullname=user.fullname,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
    )

    db.add(item)

    db.commit()

    db.refresh(item)

    return item


def create_customer(
    db,
    customer
):

    item = Customer(
        Customer_Name=customer.Customer_Name,
        phone=customer.phone,
        Branch=customer.Branch,
        Zone=customer.Zone,
        september=customer.september,
        october=customer.october,
        november=customer.november
    )

    db.add(item)

    db.commit()

    db.refresh(item)

    return item

#prediction_history
def create_prediction_history(db, prediction_data: dict):
    item = PredictionHistory(**prediction_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_predictions(
    db,
    page: int = 1,
    limit: int = 10,
    search: str = None,
    branch: str = None,
    zone: str = None,
    status: str = None,
    month: int = None,
    year: int = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    from sqlalchemy import desc, asc
    query = db.query(PredictionHistory)
    
    if search:
        from models import Customer
        query = query.outerjoin(Customer).filter(
            (PredictionHistory.meter_number.ilike(f"%{search}%")) |
            (PredictionHistory.branch.ilike(f"%{search}%")) |
            (PredictionHistory.zone.ilike(f"%{search}%")) |
            (Customer.Customer_Name.ilike(f"%{search}%"))
        )
        
    if branch:
        query = query.filter(PredictionHistory.branch.ilike(branch))
    if zone:
        query = query.filter(PredictionHistory.zone.ilike(zone))
    if status:
        query = query.filter(PredictionHistory.prediction_status.ilike(status))
        
    if month:
        from sqlalchemy import extract
        query = query.filter(extract('month', PredictionHistory.created_at) == month)
    if year:
        from sqlalchemy import extract
        query = query.filter(extract('year', PredictionHistory.created_at) == year)
        
    sort_column = getattr(PredictionHistory, sort_by, PredictionHistory.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
        
    total = query.count()
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()
    
    return total, results

def get_prediction_by_id(db, prediction_id: int):
    return db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()

def update_prediction(db, prediction_id: int, update_data: dict):
    item = get_prediction_by_id(db, prediction_id)
    if not item:
        return None
    for key, val in update_data.items():
        if hasattr(item, key):
            setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item

def delete_prediction(db, prediction_id: int):
    item = get_prediction_by_id(db, prediction_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


