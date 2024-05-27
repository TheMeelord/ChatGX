import asyncio

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.data import init_db

from src.api.routers.user_router import user_router

def create_app():
    init_db()

    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(user_router, prefix="/user")

    return app
