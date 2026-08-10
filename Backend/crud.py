from models import PredictionHistory, User, Customer, ActivityLog
from passwordhelper import hash_password


def log_activity(
    db,
    action: str,
    user_id: int | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    entity_code: str | None = None,
    description: str | None = None,
    old_data: str | None = None,
    new_data: str | None = None,
    ip_address: str | None = None,
):
    try:
        log_entry = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            entity_code=entity_code,
            description=description,
            old_data=old_data,
            new_data=new_data,
            ip_address=ip_address,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        db.rollback()
        print(f"[ActivityLog] Error logging activity {action}: {e}")
        return None


def create_user(db, user):

    item = User(
        username=user.username,
        fullname=user.fullname,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
        assigned_branch=user.assigned_branch,
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
    if hasattr(data, "assigned_branch") and data.assigned_branch is not None:
        user.assigned_branch = data.assigned_branch

    # Only hash and replace password when a new one is provided
    if data.password:
        user.password = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return user, None


def create_customer(
    db,
    customer_data,
    record_source: str = "manual"
):
    if hasattr(customer_data, "Customer_Name"):
        name = customer_data.Customer_Name
        branch = customer_data.Branch
        zone = customer_data.Zone
        sep = customer_data.september
        oct_val = customer_data.october
        nov_val = getattr(customer_data, "november", None)
    else:
        name = customer_data.get("Customer_Name")
        branch = customer_data.get("Branch")
        zone = customer_data.get("Zone")
        sep = customer_data.get("september")
        oct_val = customer_data.get("october")
        nov_val = customer_data.get("november")

    item = Customer(
        customer_code="TEMP",
        record_source=record_source,
        Customer_Name=name,
        Branch=branch,
        Zone=zone,
        september=sep,
        october=oct_val,
        november=nov_val
    )

    db.add(item)
    db.flush()
    item.customer_code = f"CUS-{item.id:05d}"
    db.commit()
    db.refresh(item)

    return item


def get_customer_by_code(db, customer_code: str):
    if not customer_code:
        return None
    return (
        db.query(Customer)
        .filter(Customer.customer_code.ilike(customer_code.strip()))
        .first()
    )


def get_customer_by_id(db, customer_id: int):
    return db.query(Customer).filter(Customer.id == customer_id).first()


def update_customer(db, customer_id: int, update_data: dict):
    item = get_customer_by_id(db, customer_id)
    if not item:
        return None
    for key, val in update_data.items():
        if hasattr(item, key) and val is not None:
            setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item


def get_activity_logs(
    db,
    page: int = 1,
    limit: int = 10,
    search: str = None,
    user_id: int = None,
    action: str = None,
    sort_order: str = "desc",
):
    from sqlalchemy import desc, asc
    from sqlalchemy.orm import joinedload

    query = db.query(ActivityLog).options(joinedload(ActivityLog.user))

    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if action and action.strip().lower() != "all":
        query = query.filter(ActivityLog.action.ilike(action.strip()))

    if search:
        s = f"%{search.strip()}%"
        query = query.outerjoin(User, ActivityLog.user_id == User.id).filter(
            (ActivityLog.action.ilike(s))
            | (ActivityLog.entity_code.ilike(s))
            | (ActivityLog.description.ilike(s))
            | (User.fullname.ilike(s))
            | (User.username.ilike(s))
        ).distinct()

    if sort_order == "desc":
        query = query.order_by(desc(ActivityLog.created_at))
    else:
        query = query.order_by(asc(ActivityLog.created_at))

    total = query.count()
    offset = (page - 1) * limit
    logs = query.offset(offset).limit(limit).all()
    return total, logs


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
    STAFF / others -> only their own predictions (user_id == current_user.id) AND within their assigned branch
    """
    role = _normalize_role(getattr(current_user, "role", None))

    if role in ("admin", "administrator"):
        return query

    # STAFF and any non-admin role: only own records and in their assigned branch
    branch = getattr(current_user, "assigned_branch", None)
    if branch:
        return query.filter(PredictionHistory.user_id == current_user.id, PredictionHistory.branch == branch)
    else:
        # If no branch is assigned, they see nothing
        return query.filter(PredictionHistory.id == -1)


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
    
    branch = getattr(current_user, "assigned_branch", None)
    if not branch or prediction.branch != branch:
        return False
        
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


