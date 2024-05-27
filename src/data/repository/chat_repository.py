from sqlalchemy.orm import Session

from src.data.dbo.ChatDbo import MessageDbo, ChatDbo


class chat_repository:
    def __init__(self, db: Session):
        self.db = db

    async def create_chat(self, user1_id, user2_id):
        new_chat = ChatDbo(user1_id=user1_id, user2_id=user2_id)
        self.db.add(new_chat)
        self.db.commit()
        self.db.refresh(new_chat)
        return new_chat

    async def save_message(self, chat_id, sender_id, message):
        new_message = MessageDbo(chat_id=chat_id, sender_id=sender_id, message=message)
        self.db.add(new_message)
        self.db.commit()
        self.db.refresh(new_message)
        return new_message

    async def get_all_messages_by_chat_id(self, chat_id: int):
        return self.db.query(MessageDbo).filter(MessageDbo.chat_id == chat_id).all()

    async def get_chat_id_by_users_ids(self, user1_id, user2_id):
        chat = self.db.query(ChatDbo).filter((ChatDbo.user1_id == user1_id) & (ChatDbo.user2_id == user2_id)).first()
        if chat:
            return chat.id
        return None

    async def get_all_chats_by_user_id(self, user_id):
        return self.db.query(ChatDbo).filter((ChatDbo.user1_id == user_id) | (ChatDbo.user2_id == user_id)).all()
