import os
import json
from dotenv import load_dotenv
from langchain import LLMChain, PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_google_genai import GoogleGemini
from .models import QuizOutput


load_dotenv()
GEMINI_API_KEY = os.getenv("AIzaSyC2-AeVWWYxy7V4oAxS4bHYbq-kFY3zjZ8")
MODEL = os.getenv("gemini-2.5-flash")


# Initialize a Gemini client wrapped for LangChain


def get_gemini_llm():
# This uses langchain-google-genai's GoogleGemini wrapper
# It expects GEMINI_API_KEY to be available as environment variable
return GoogleGemini(model=MODEL, api_key=GEMINI_API_KEY, temperature=0.0)




# Build a prompt template that instructs the model and requests strict JSON
PROMPT = """
You are an assistant that reads a cleaned Wikipedia article and generates an educational quiz.
Return a JSON strictly matching the format described. Keep questions varied (5-10 items), include options for MCQs, include at least one true/false or short answer.


Article Title: {title}


Article Text:
{article_text}


Respond ONLY in JSON and adhere to the schema: {schema}


Guidelines:
- Provide between 5 and 10 questions.
- For MCQs, include at least 3 options and mark the correct one.
- Include a short summary (2-4 sentences) describing the article.
- Include key_entities (list) and related_topics (list).
"""




def generate_quiz(article_text: str, title: str) -> dict:
parser = PydanticOutputParser(pydantic_object=QuizOutput)
schema = parser.get_format_instructions()


prompt = PromptTemplate(
input_variables=["title", "article_text", "schema"],
template=PROMPT,
)


llm = get_gemini_llm()
chain = LLMChain(llm=llm, prompt=prompt)


# Run the chain
formatted_prompt = prompt.format(title=title, article_text=article_text, schema=schema)
raw = chain.run({"title": title, "article_text": article_text, "schema": schema})


# Use parser to validate and convert to python object
parsed = parser.parse(raw)
# pydantic model -> dict
return json.loads(parsed.json())