from fastapi import FastAPI
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from app.router import (
    auth_router, 
)


# start the FastAPI application with 
# fastapi dev main.py
app = FastAPI(title="Kira", version="0.0.1") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

#####################
### test endpoint ###
#####################
@app.get("/")
def read_root():
    return {"Hello": "World Static"}
