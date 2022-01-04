#!/usr/bin/env python3.9
import os
import uvicorn
import config
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": config.API_PORT}

if __name__ == "__main__":
  uvicorn.run(app, host="127.0.0.1", port=config.API_PORT)