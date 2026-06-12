from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import BigInteger
from sqlalchemy import ForeignKey

from app.database.db import Base

class Review(Base):

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)

    amazon_user_id = Column(String)

    amazon_product_id = Column(String)

    score = Column(Integer)

    helpful_num = Column(Integer)

    helpful_den = Column(Integer)

    review_time = Column(BigInteger)

    summary = Column(Text)

    review_text = Column(Text)