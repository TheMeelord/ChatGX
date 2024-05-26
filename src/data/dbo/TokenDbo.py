from sqlalchemy.orm import relationship

from src.data.config import Base
from sqlalchemy import Column, Integer, String, ForeignKey


class TokenDbo(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True)

    owner = relationship("UserDbo", back_populates="tokens")
