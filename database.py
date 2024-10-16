from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

class Database:
    def __init__(self):
        # Set up database
        DATABASE_URL = 'sqlite:///emotions.db'  # Change to your database URL
        self.engine = create_engine(DATABASE_URL)
        self.base = declarative_base()
        self.base.metadata.create_all(self.engine)
        self.session = sessionmaker(bind=engine)
        #session = Session()
        

class EmotionRecord(Base):
    __tablename__ = 'emotions'
    id = Column(Integer, primary_key=True)
    #datetime = Column(DateTime, default=datetime.utcnow)
    datetime = Column(DateTime, default=lambda: datetime.now(singapore_tz))
    emotion_detected = Column(String)
    userid = Column(String)  # Add this line to store the userid as a string

class PainRecord(Base):
    __tablename__ = 'pain detection'
    id = Column(Integer, primary_key=True)
    #datetime = Column(DateTime, default=datetime.utcnow)
    datetime = Column(DateTime, default=lambda: datetime.now(singapore_tz))
    pain_level = Column(String)  # pain level value integer (0 = no pain, 1 = pain, 2 = very pain)
    userid = Column(String)  # UserID to link this record to a user

class AttentionRecord(Base):
    __tablename__ = 'attention'
    id = Column(Integer, primary_key=True)
    datetime = Column(DateTime, default=lambda: datetime.now(singapore_tz))
    pain_level = Column(String)
    emotion = Column(String)
    userid = Column(String)

