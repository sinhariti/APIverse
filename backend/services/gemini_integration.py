import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

async def generate_code_snippet(data):
    api_name = data.get("api_id", "Unknown API")
    frontend = data.get("frontend", "React")
    use_case = data.get("use_case", "fetch data and handle auth")
    description = data.get("description", "This is an API integration task.")

    prompt = f"""
You are an expert frontend developer.

Write a minimal and precise function in {frontend} to fetch data from an API named '{api_name}'.
Context: {use_case}.
API Description: {description}.

Only output the main function that performs the API call — include auth and error handling inside the function.
No explanations, no extra content. Just the function, as short and clean as possible.
"""

    response = model.generate_content(prompt)
    return response.text.strip()