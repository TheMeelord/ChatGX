import asyncio

from fastapi import FastAPI

from src.data import init_db
from src.data.config import get_db
from src.data.dbo.UserDbo import UserDbo
from src.data.repository.user_repository import user_repository

from src.api.routers.user_router import user_router

def create_app():
    init_db()

    app = FastAPI()
    app.include_router(user_router, prefix="/user")

    return app

