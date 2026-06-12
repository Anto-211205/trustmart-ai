from sqlalchemy import Column, Integer, String
from app.database.db import Base

class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    amazon_product_id = Column(String, unique=True)