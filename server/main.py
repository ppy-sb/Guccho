#!/usr/bin/env python3.9
from logging import log
import uvicorn
import config
from fastapi import FastAPI
from routers import auth
from objects.database import db

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await db.connect()
    print("Connected to database")

app.include_router(auth.router, prefix="/auth")

if __name__ == "__main__":
  uvicorn.run(app, host="127.0.0.1", port=config.API_PORT, log_level="info")