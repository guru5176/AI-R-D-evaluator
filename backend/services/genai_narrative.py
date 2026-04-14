import os
import google.generativeai as genai

# ✅ Gemini Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL)

def generate_ai_narrative(proposal_text, novelty, finance, final_score, decision):

    prompt = f"""
You are an expert research funding reviewer.

Proposal Summary:
{proposal_text[:1500]}

Evaluation Scores:
- Novelty Score: {novelty:.2f}
- Finance Score: {finance:.2f}
- Final Score: {final_score:.2f}

Decision: {decision}

Write a professional evaluation narrative in 8–10 lines.
"""
    generation_config = genai.GenerationConfig(temperature=0.4)
    response = model.generate_content(prompt, generation_config=generation_config)

    return response.text.strip()
