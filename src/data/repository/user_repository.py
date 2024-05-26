from sqlalchemy.orm import Session

from src.data.dbo.UserDbo import UserDbo


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

    async def get_user_by_email(self, email):
        return self.db.query(UserDbo).filter(UserDbo.email == email).first()
