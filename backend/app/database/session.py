from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from app.config import Settings, settings
import os



def build_sqlalchemy_database_url_from_settings(_settings: Settings) -> str:
    """
    Builds a SQLAlchemy URL based on the provided settings.

    Parameters:
        _settings (Settings): An instance of the Settings class
        containing the PostgreSQL connection details.

    Returns:
        str: The generated SQLAlchemy URL.
    """
    # Use SQLite instead of PostgreSQL
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "kira.db")
    return f"sqlite:///{db_path}"


def get_engine(database_url: str, echo=False) -> Engine:
    """
    Creates and returns a SQLAlchemy Engine object for connecting to a database.

    Parameters:
        database_url (str): The URL of the database to connect to.
        Defaults to SQLALCHEMY_DATABASE_URL.
        echo (bool): Whether or not to enable echoing of SQL statements.
        Defaults to False.

    Returns:
        Engine: A SQLAlchemy Engine object representing the database connection.
    """
    engine = create_engine(database_url, echo=echo)
    return engine


def get_local_session(database_url: str, echo=False, **kwargs) -> sessionmaker:
    """
    Create and return a sessionmaker object for a local database session.

    Parameters:
        database_url (str): The URL of the local database.
        Defaults to `SQLALCHEMY_DATABASE_URL`.
        echo (bool): Whether to echo SQL statements to the console.
        Defaults to `False`.

    Returns:
        sessionmaker: A sessionmaker object configured for the local database session.
    """
    engine = get_engine(database_url, echo)
    session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return session


SQLALCHEMY_DATABASE_URL = build_sqlalchemy_database_url_from_settings(settings)