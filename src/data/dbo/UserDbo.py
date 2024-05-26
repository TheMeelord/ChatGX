from src.data.config import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class UserDbo(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, index=True)
    hashed_password = Column(String)

    tokens = relationship("TokenDbo", back_populates="owner")