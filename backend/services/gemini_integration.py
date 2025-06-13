import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

async def generate_code_snippet(data):
    api_name = data.get("api_id", "Unknown API")
    frontend = data.get("frontend", "react")
    use_case = data.get("use_case", "fetch data and handle auth")
    description = data.get("description", "This is an API integration task.")

    prompt = f"""
    You are an expert API integrator. 
    Generate frontend integration code in {frontend} to use the API called '{api_name}'.
    Task: {use_case}.
    API Description: {description}.
    Include proper auth handling, error handling, and fetch logic.
    """

    response = model.generate_content(prompt)
    return response.text