from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from .database import Base
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class Quiz(Base):
__tablename__ = "quizzes"
id = Column(Integer, primary_key=True, index=True)
url = Column(String, nullable=False)
title = Column(String, nullable=True)
date_generated = Column(DateTime, default=datetime.utcnow)
scraped_content = Column(Text, nullable=True)
full_quiz_data = Column(Text, nullable=False) # JSON stored as text


# Pydantic models for validation and responses
class QuestionOption(BaseModel):
text: str
is_correct: bool


class Question(BaseModel):
id: int
question: str
type: str # e.g., "mcq", "short_answer", "true_false"
options: Optional[List[QuestionOption]] = None
difficulty: Optional[str] = None
explanation: Optional[str] = None


class QuizOutput(BaseModel):
title: str
url: str
summary: str
questions: List[Question]
key_entities: Optional[List[str]] = None
related_topics: Optional[List[str]] = None


class QuizListItem(BaseModel):
id: int
url: str
title: Optional[str]
date_generated: datetime