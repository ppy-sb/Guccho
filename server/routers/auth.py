from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from models import user as u

# to get a string like this run:
# openssl rand -hex 32
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.post("/token", response_model=u.Token)
async def login_for_access_token(request: Request):
    """Handles authenticating and creating token for user."""

    form_data = await request.json()
    user = await u.authenticate_user(form_data["username"],
                                     form_data["password"])

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = u.create_access_token(
        data={"sub": user.name}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/user/me/", response_model=u.User)
async def read_users_me(current_user: u.User = Depends(u.get_current_user)):
    """XXX: TODO"""
    return current_user
