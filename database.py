from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
import pytz

from datetime import datetime, timedelta
Base = declarative_base()

class EmotionRecord(Base):
    __tablename__ = 'emotions'
    id = Column(Integer, primary_key=True)
    #datetime = Column(DateTime, default=datetime.utcnow)
    my_timestamp = Column(DateTime, default=lambda: datetime.now(singapore_tz))
    emotion_detected = Column(String)
    pain_level = Column(Integer)  # pain level value integer (0 = no pain, 1 = pain, 2 = very pain)
    userid = Column(String)  # Add this line to store the userid as a string

# class PainRecord(Base):
#     __tablename__ = 'pain_detection'
#     id = Column(Integer, primary_key=True)
#     #datetime = Column(DateTime, default=datetime.utcnow)
#     datetime = Column(DateTime, default=lambda: datetime.now(singapore_tz))
#     pain_level = Column(String)  # pain level value integer (0 = no pain, 1 = pain, 2 = very pain)
#     userid = Column(String)  # UserID to link this record to a user

class AttentionRecord(Base):
    __tablename__ = 'attention'
    id = Column(Integer, primary_key=True)
    datetime = Column(DateTime, default=lambda: datetime.now(singapore_tz))
    pain_level = Column(String)
    emotion = Column(String)
    userid = Column(String)

singapore_tz = pytz.timezone('Asia/Singapore')  
DATABASE_URL = 'sqlite:///emotions.db'  # Change to your database URL
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
class Database:
    _instance = None  
    
    def __new__(cls, *args, **kwargs):
        """Override __new__ to ensure only one instance is created."""
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            
        return cls._instance
    
    # def __init__(self):
    #     # Set up database
    #     session = Session()
    
    def save(self, record):
        session.add(record)

    def commit(self):
        session.commit()

    def countAttention(self):
        ten_seconds_ago = datetime.now(singapore_tz)- timedelta(seconds=10)
        print('ten_seconds_ago', ten_seconds_ago)
        sql_query = text("""
            select count(*) from emotions
            where pain_level = 2
            and emotion_detected in ('Fear','Disgust','Anger','Sadness')
            and my_timestamp >= :ten_seconds_ago;
        """)
        #

        # Execute the query
        with engine.connect() as connection:
            result = connection.execute(sql_query, {'ten_seconds_ago': ten_seconds_ago})
            count = result.scalar()  # Fetch the count from the result

        return count




