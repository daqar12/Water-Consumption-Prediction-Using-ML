from models import User, Customer
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


