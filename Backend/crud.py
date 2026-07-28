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


def get_user_by_id(db, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user(db, user_id: int, data):
    """
    Update fullname, phone, email, and optionally password.
    Returns (user, error_message). error_message is None on success.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None, "User not found."

    # Reject duplicate email (case-insensitive), excluding the current user
    email_owner = (
        db.query(User)
        .filter(User.email.ilike(data.email), User.id != user_id)
        .first()
    )
    if email_owner:
        return None, "Email already exists."

    # Reject duplicate phone, excluding the current user
    phone_owner = (
        db.query(User)
        .filter(User.phone == data.phone, User.id != user_id)
        .first()
    )
    if phone_owner:
        return None, "Phone number already exists."

    # fullname is unique in the schema — avoid colliding with another user
    name_owner = (
        db.query(User)
        .filter(User.fullname.ilike(data.fullname), User.id != user_id)
        .first()
    )
    if name_owner:
        return None, "Full name already exists."

    user.fullname = data.fullname
    user.phone = data.phone
    user.email = data.email

    # Only hash and replace password when a new one is provided
    if data.password:
        user.password = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return user, None


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


def _normalize_role(role: str | None) -> str:
    return (role or "").strip().lower()


def apply_role_visibility(query, current_user):
    """
    ADMIN -> every prediction in the database (no user_id filter)
    STAFF / others -> only their own predictions (user_id == current_user.id)
    """
    role = _normalize_role(getattr(current_user, "role", None))

    if role in ("admin", "administrator"):
        return query

    # STAFF and any non-admin role: only own records
    return query.filter(PredictionHistory.user_id == current_user.id)


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
    sort_order: str = "desc",
    current_user=None,
):
    from sqlalchemy import desc, asc
    from sqlalchemy.orm import joinedload

    query = db.query(PredictionHistory).options(
        joinedload(PredictionHistory.customer),
        joinedload(PredictionHistory.user),
    )

    if current_user is not None:
        query = apply_role_visibility(query, current_user)

    if search:
        query = query.outerjoin(Customer).outerjoin(User, PredictionHistory.user_id == User.id).filter(
            (PredictionHistory.meter_number.ilike(f"%{search}%")) |
            (PredictionHistory.branch.ilike(f"%{search}%")) |
            (PredictionHistory.zone.ilike(f"%{search}%")) |
            (Customer.Customer_Name.ilike(f"%{search}%")) |
            (User.fullname.ilike(f"%{search}%"))
        ).distinct()

    if branch:
        query = query.filter(PredictionHistory.branch.ilike(branch))
    if zone:
        query = query.filter(PredictionHistory.zone.ilike(zone))
    if status:
        query = query.filter(PredictionHistory.prediction_status.ilike(status))

    if month:
        from sqlalchemy import extract
        query = query.filter(extract("month", PredictionHistory.created_at) == month)
    if year:
        from sqlalchemy import extract
        query = query.filter(extract("year", PredictionHistory.created_at) == year)

    sort_column = getattr(PredictionHistory, sort_by, PredictionHistory.created_at)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    total = query.count()
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    return total, results


def get_predictions_for_export(db, current_user):
    """Return prediction rows visible to the current user (no pagination)."""
    from sqlalchemy.orm import joinedload

    query = db.query(PredictionHistory).options(
        joinedload(PredictionHistory.customer),
        joinedload(PredictionHistory.user),
    )
    query = apply_role_visibility(query, current_user)
    return query.order_by(PredictionHistory.created_at.desc()).all()


def user_can_access_prediction(current_user, prediction) -> bool:
    role = _normalize_role(getattr(current_user, "role", None))
    if role in ("admin", "administrator"):
        return True
    return prediction.user_id == current_user.id


def get_prediction_by_id(db, prediction_id: int):
    from sqlalchemy.orm import joinedload

    return (
        db.query(PredictionHistory)
        .options(
            joinedload(PredictionHistory.customer),
            joinedload(PredictionHistory.user),
        )
        .filter(PredictionHistory.id == prediction_id)
        .first()
    )

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


