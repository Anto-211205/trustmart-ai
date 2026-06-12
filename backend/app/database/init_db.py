from app.database.db import engine

from app.models.user import User
from app.models.product import Product
from app.models.review import Review

Base = User.metadata

Base.create_all(bind=engine)