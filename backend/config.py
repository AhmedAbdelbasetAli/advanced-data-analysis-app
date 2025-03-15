import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql+pg8000://'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'creator': None  # Will be set in __init__.py
    }