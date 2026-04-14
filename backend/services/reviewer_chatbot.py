import os
import google.generativeai as genai

# ✅ Gemini Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL)

def reviewer_chat_response(question, proposal_text, evaluation_summary):

    prompt = f"""
You are a funding proposal reviewer agent.

Proposal Text:
{proposal_text[:1500]}

Evaluation Summary:
{evaluation_summary}

User Question:
{question}

Answer clearly in 5–6 lines like a reviewer.
"""
    generation_config = genai.GenerationConfig(temperature=0.5)
    response = model.generate_content(prompt, generation_config=generation_config)

    return response.text.strip()
