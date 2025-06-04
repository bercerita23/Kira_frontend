from app.database.session import get_engine, SQLALCHEMY_DATABASE_URL
from app.model import user_model, question_model, quiz_model, reward_model, school_model, user_history_model

# Collect all Base classes (assuming all models inherit from the same Base)
Base = user_model.Base

engine = get_engine(SQLALCHEMY_DATABASE_URL)
Base.metadata.create_all(bind=engine)
print("Database tables created.") 