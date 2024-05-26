from sqlalchemy.orm import Session
from time import gmtime
from src.data.dbo.TokenDbo import TokenDbo


class token_repository:
    def __init__(self, db: Session):
        self.db = db

    async def get_token(self, user_id):
        return self.db.query(TokenDbo).filter(TokenDbo.user_id == user_id).first()

    async def create_token(self, user_id):
        token = TokenDbo(user_id=user_id, token=hash(f"{user_id}{gmtime()}"))
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token