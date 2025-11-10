from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import re
import random
import json
import traceback

try:
    # Prefer absolute imports when running as a script
    import llm_quiz_generator
    llm_generate_quiz = llm_quiz_generator.generate_quiz
except Exception:
    try:
        from .llm_quiz_generator import generate_quiz as llm_generate_quiz
    except Exception:
        llm_generate_quiz = None


class GenerateRequest(BaseModel):
    url: str


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for quick local testing. Each record:
# { id, url, title, date_generated, full_quiz_data }
_STORAGE: List[dict] = []


@app.post('/generate_quiz')
async def generate_quiz(req: GenerateRequest):
    # Scrape the Wikipedia article and generate quiz questions from the content.
    url = req.url
    print(f"/generate_quiz called with url={url}")
    try:
        from .scraper import scrape_wikipedia
    except Exception:
        # local import fallback
        from scraper import scrape_wikipedia

    try:
        title, clean_text = scrape_wikipedia(url)
    except Exception as e:
        print("Scrape failed:", e)
        raise HTTPException(status_code=400, detail=f"Scrape error: {e}")

    # Simple heuristic generator (no LLM): pick factual sentences and make MCQs
    import re
    import random

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', clean_text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 40]

    if len(sentences) < 5:
        # fallback to paragraphs
        paras = [p.strip() for p in clean_text.split('\n\n') if len(p.strip()) > 40]
        sentences = []
        for p in paras:
            s = re.split(r'(?<=[.!?])\s+', p)
            for t in s:
                if len(t.strip()) > 40:
                    sentences.append(t.strip())

    if not sentences:
        raise HTTPException(status_code=400, detail='Not enough textual content to generate questions')

    # Choose between 5 and 8 questions (or less if not enough sentences)
    qcount = min(max(5, min(10, len(sentences)//1)), len(sentences))
    # pick candidate indices
    indices = list(range(len(sentences)))
    random.shuffle(indices)
    chosen = indices[:qcount]

    questions = []
    for idx in chosen:
        correct = sentences[idx]
        # pick 3 distractors from other sentences
        others = [s for i, s in enumerate(sentences) if i != idx]
        random.shuffle(others)
        distractors = others[:3] if len(others) >= 3 else others
        choices = [correct] + distractors
        random.shuffle(choices)
        questions.append({
            'question': 'Which of the following statements is stated in the article?',
            'choices': choices,
            'correct_answer': correct,
            'explanation': correct
        })

    # summary: first two sentences
    summary_sentences = sentences[:2]
    summary = ' '.join(summary_sentences)

    sample_quiz = {
        'title': title,
        'summary': summary,
        'questions': questions
    }

    record = {
        'id': len(_STORAGE) + 1,
        'url': url,
        'title': sample_quiz['title'],
        'date_generated': datetime.utcnow().isoformat(),
        'full_quiz_data': sample_quiz
    }
    _STORAGE.append(record)
    print(f"Generated quiz with {len(questions)} questions for url={url}")
    return sample_quiz


@app.get('/history')
async def history():
    # Return minimal metadata for each saved quiz
    return [
        {
            'id': r['id'],
            'url': r['url'],
            'title': r['title'],
            'date_generated': r['date_generated']
        }
        for r in _STORAGE
    ]


@app.get('/quiz/{quiz_id}')
async def get_quiz(quiz_id: int):
    for r in _STORAGE:
        if r['id'] == quiz_id:
            # Return the full record (frontend expects full_quiz_data)
            return r
    raise HTTPException(status_code=404, detail='Quiz not found')


@app.get('/healthz')
async def healthz():
    return {"status": "ok"}