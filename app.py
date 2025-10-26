import base64
import io
import os
from flask import Flask, request, jsonify, render_template
from PIL import Image
from gradio_client import Client, handle_file
import httpx
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

# --- Load environment variables ---
load_dotenv()

# --- Initialize Flask app ---
app = Flask(__name__)

# --- Initialize Hugging Face model client ---
hf_client = Client(
    "PatientZero6969/civic-issue-image-classifier",
    httpx_kwargs={"timeout": httpx.Timeout(60.0, connect=60.0)}
)

# --- Department mapping ---
DEPARTMENT_MAP = {
    "potholes": "Public Works Department (PWD)",
    "DamagedElectricalPoles": "State Electricity Board",
    "garbage": "Urban Development Department (Municipal Sanitation Wing)",
    "WaterLogging": "Municipal Drainage Department",
    "FallenTrees": "Municipal Horticulture Department / Disaster Management Cell"
}

# --- Define structured output for Gemini ---
class MaintenanceReport(BaseModel):
    priority_level: int = Field(..., description="Priority from 1–10 (10 = most urgent)")
    department: str = Field(..., description="Department responsible for the issue")
    justification: str = Field(..., description="Short explanation of reasoning")

# --- Initialize Gemini model ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
).with_structured_output(MaintenanceReport)

# --- Prompt for LangChain ---
prompt = PromptTemplate.from_template("""
You are an AI civic agent that classifies and prioritizes city maintenance issues.

Given:
- Image classification: {issue_type} (confidence {confidence})
- Citizen description: "{description}"
- Location context: {location}

Decide:
1. Priority level (1–10)
2. Handling department
3. Brief justification

Return a structured JSON.
""")

chain = prompt | llm


# --- Helper: Decode base64 → PIL Image ---
def decode_base64_image(base64_string):
    try:
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        image_path = "temp_image.jpg"
        image.save(image_path)
        return image_path
    except Exception as e:
        raise ValueError(f"Invalid base64 image: {e}")


# --- Main Flask endpoint ---
@app.route("/analyze", methods=["POST"])
def analyze_issue():
    try:
        data = request.get_json()

        base64_img = data.get("image_base64")
        description = data.get("description", "")
        location = data.get("location", "Unknown")

        if not base64_img:
            return jsonify({"error": "Missing image_base64"}), 400

        # Decode base64 image to file
        image_path = decode_base64_image(base64_img)

        # Step 1: Predict issue type using Hugging Face model
        hf_result = hf_client.predict(image=handle_file(image_path), api_name="/predict_issue")

        issue_type = hf_result.get("category", "Unknown")
        confidence = hf_result.get("confidence", 0)

        # Normalize issue key for department mapping
        dept_key = issue_type.replace(" ", "").replace("-", "").capitalize()
        department = DEPARTMENT_MAP.get(dept_key, "General Municipal Department")

        # Step 2: Ask Gemini LLM to analyze priority + justification
        result_object = chain.invoke({
            "issue_type": issue_type,
            "confidence": confidence,
            "description": description,
            "location": location
        })

        # Step 3: Combine structured result
        output = {
            "success": True,
            "issue_type": issue_type,
            "confidence": confidence,
            "predicted_department": department,
            "priority_level": result_object.priority_level,
            "final_department": result_object.department or department,
            "justification": result_object.justification
        }

        return jsonify(output)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/test")
def test():
    return render_template("test.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)