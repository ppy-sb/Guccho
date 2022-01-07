#!/usr/bin/env python3.9
import uvicorn
import config
from fastapi import FastAPI
from routers import auth
from objects.database import db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await db.connect()
    print("Connected to database") # XXX: perpahs use cmyui logger? ~lenforiee

app.include_router(auth.router, prefix="/v1/auth")

# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
  uvicorn.run(app, host="127.0.0.1", port=config.API_PORT, log_level="info")
