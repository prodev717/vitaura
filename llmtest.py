from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

load_dotenv()

class MaintenanceReport(BaseModel):
    priority_level: int = Field(..., description="A priority level from 1 to 10, where 10 is the most urgent.")
    department: str = Field(..., description="The city department responsible for handling the issue.")
    justification: str = Field(..., description="A brief explanation for the decision.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
).with_structured_output(MaintenanceReport)

prompt = PromptTemplate.from_template("""
You are an AI civic agent that classifies and prioritizes city maintenance issues.

Given:
- Image classification: {issue_type} (confidence {confidence})
- Citizen description: "{description}"
- Location: {location}

Decide on the priority level (1–10), the handling department, and justify your decision.
""")

chain = prompt | llm

input_data = {
    "issue_type": "Potholes",
    "confidence": 0.97,
    "description": "Huge potholes on the main road causing accidents.",
    "location": "VIT-AP Main Road"
}

result_object = chain.invoke(input_data)

print(result_object.model_dump_json(indent=2))
