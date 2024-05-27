from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from src.data.config import Base


class MessageDbo(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('users.id'))
    message = Column(String)

    sender = relationship("UserDbo")
    chat_id = Column(Integer, ForeignKey('chats.id'))
    chat = relationship("ChatDbo", back_populates="messages")


class ChatDbo(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey('users.id'))
    user2_id = Column(Integer, ForeignKey('users.id'))

    user1 = relationship("UserDbo", foreign_keys=[user1_id])
    user2 = relationship("UserDbo", foreign_keys=[user2_id])
    messages = relationship("MessageDbo", back_populates="chat")