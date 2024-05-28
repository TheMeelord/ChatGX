from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.api.dto.UserDto import UserRegisterResponse, UserRegisterRequest, UserLoginResponse, UserLoginRequest, \
    UserGetAllResponse, UserDtoResponse
from src.data.config import get_db
from src.data.dbo.UserDbo import UserDbo
from src.data.repository.token_repository import token_repository
from src.data.repository.user_repository import user_repository

user_router = APIRouter()


@user_router.post("/register", response_model=UserRegisterResponse)
async def register_user(user: UserRegisterRequest, db: Session = Depends(get_db)):
    try:
        user_repo = user_repository(db)
        if await user_repo.is_user_exist(user.email):
            raise HTTPException(status_code=400, detail="User with the same email already exists")

        # TODO : hash_password
        db_user = UserDbo(email=user.email, username=user.username, hashed_password=user.password)
        await user_repo.create_user(db_user)

        return UserRegisterResponse(message="User registered")

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during user registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@user_router.post("/login", response_model=UserLoginResponse)
async def login_user(user: UserLoginRequest, db: Session = Depends(get_db)):
    try:
        user_repo = user_repository(db)
        if not await user_repo.is_user_exist(user.email):
            raise HTTPException(status_code=401, detail="User didn't registered yet")

        token_repo = token_repository(db)

        user_db = await user_repo.get_user_by_email(user.email)
        token = await token_repo.get_token(user_db.id)
        if token is None:
            token = await token_repo.create_token(user_db.id)
        return UserLoginResponse(token=token.token)


    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during user login: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@user_router.get("/get_all/{token}", response_model=UserGetAllResponse)
async def get_all_users(token: str, db: Session = Depends(get_db)):
    try:
        user_repo = user_repository(db)
        token_repo = token_repository(db)

        user = await user_repo.get_user_by_token(token, token_repo)
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized")

        users = await user_repo.get_all_users()
        users_send = UserGetAllResponse(users=[UserDtoResponse(id=u.id, username=u.username) for u in users if u.id != user.id])
        return users_send

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")