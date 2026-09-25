import os
from dotenv import load_dotenv
import openai

# Load .env file
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not found in environment")

openai.api_key = api_key

client = openai.OpenAI()
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, what is the current date?"}],
    max_tokens=50,
)
print("Response:", response.choices[0].message.content.strip())


