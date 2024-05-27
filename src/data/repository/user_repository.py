from sqlalchemy.orm import Session

from src.data.dbo.UserDbo import UserDbo
from src.data.repository.token_repository import token_repository


class user_repository:
    def __init__(self, db: Session):
        self.db = db

    async def create_user(self, user: UserDbo):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    async def is_user_exist(self, email):
        return self.db.query(UserDbo).filter(UserDbo.email == email).first() is not None
    async def is_user_exist_by_id(self, id):
        return self.db.query(UserDbo).filter(UserDbo.id == id).first() is not None

    async def get_user_by_email(self, email):
        return self.db.query(UserDbo).filter(UserDbo.email == email).first()

    async def get_user_by_token(self, token_str, token_repo: token_repository):
        user_id = await token_repo.get_user_id_by_token(token_str)
        if user_id:
            return self.db.query(UserDbo).filter(UserDbo.id == user_id).first()
        return None

    async def get_all_users(self):
        return self.db.query(UserDbo).all()
