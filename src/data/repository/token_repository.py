import secrets

from sqlalchemy.orm import Session
from time import gmtime
from src.data.dbo.TokenDbo import TokenDbo


class token_repository:
    def __init__(self, db: Session):
        self.db = db

    async def get_token(self, user_id):
        return self.db.query(TokenDbo).filter(TokenDbo.user_id == user_id).first()

    async def create_token(self, user_id):
        token_str = secrets.token_urlsafe(32)
        token = TokenDbo(user_id=user_id, token=token_str)
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    async def get_user_id_by_token(self, token_str):
        token = self.db.query(TokenDbo).filter(TokenDbo.token == token_str).first()
        return token.user_id if token else None