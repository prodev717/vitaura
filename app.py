import base64
import io
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
from gradio_client import Client, handle_file
import httpx
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from database import ComplaintDatabase

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize database
db = ComplaintDatabase()

# Initialize Hugging Face model client
hf_client = Client(
    "PatientZero6969/civic-issue-image-classifier",
    httpx_kwargs={"timeout": httpx.Timeout(60.0, connect=60.0)}
)

# Department mapping
DEPARTMENT_MAP = {
    "potholes": "Public Works Department (PWD)",
    "DamagedElectricalPoles": "State Electricity Board",
    "garbage": "Urban Development Department (Municipal Sanitation Wing)",
    "WaterLogging": "Municipal Drainage Department",
    "FallenTrees": "Municipal Horticulture Department / Disaster Management Cell"
}

# Define structured output for Gemini
class MaintenanceReport(BaseModel):
    priority_level: int = Field(..., description="Priority from 1–10 (10 = most urgent)")
    department: str = Field(..., description="Department responsible for the issue")
    justification: str = Field(..., description="Short explanation of reasoning")

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
).with_structured_output(MaintenanceReport)

# Prompt for LangChain
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

# Helper: Decode base64 → PIL Image
def decode_base64_image(base64_string):
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        image_path = "temp_image.jpg"
        image.save(image_path)
        return image_path
    except Exception as e:
        raise ValueError(f"Invalid base64 image: {e}")

# Main Flask endpoint - UPDATED WITH DATABASE
@app.route("/analyze", methods=["POST"])
def analyze_issue():
    try:
        data = request.get_json()

        # Extract required fields
        email = data.get("email", "").strip().lower()
        base64_img = data.get("image_base64")
        description = data.get("description", "")
        location = data.get("location", "Unknown")
        pincode = data.get("pincode", "")
        zone = data.get("zone", "")

        # Validation
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if not base64_img:
            return jsonify({"error": "Missing image_base64"}), 400
        
        if not location or not pincode or not zone:
            return jsonify({"error": "Location, pincode, and zone are required"}), 400

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
            "location": f"{location}, {zone}, {pincode}"
        })

        # Step 3: Save to database
        complaint_id, db_error = db.insert_complaint(
            email=email,
            image_base64=base64_img,
            issue_type=issue_type,
            department=result_object.department or department,
            priority=result_object.priority_level,
            justification=result_object.justification,
            confidence=confidence,
            location=location,
            pincode=pincode,
            zone=zone
        )

        if db_error:
            return jsonify({
                "error": f"Analysis successful but database error: {db_error}"
            }), 500

        # Step 4: Return combined response
        output = {
            "success": True,
            "complaint_id": complaint_id,
            "issue_type": issue_type,
            "confidence": confidence,
            "predicted_department": department,
            "priority_level": result_object.priority_level,
            "final_department": result_object.department or department,
            "justification": result_object.justification,
            "status": "pending"
        }

        return jsonify(output)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/complaints/<email>", methods=["GET"])
def get_user_complaints(email):
    try:
        email = email.strip().lower()
        complaints = db.get_complaints_by_email(email)
        
        return jsonify({
            "success": True,
            "count": len(complaints),
            "complaints": complaints
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/complaints/department/<department>", methods=["GET"])
def get_department_wise_complaints(department):
    try:
        department = department.strip().lower()
        complaints = db.get_complaints_by_department(department)
        
        return jsonify({
            "success": True,
            "count": len(complaints),
            "complaints": complaints
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/complaints/<int:serial_no>", methods=["GET"])
def get_complaint_detail(serial_no):
    try:
        complaint = db.get_complaint_by_id(serial_no)
        
        if not complaint:
            return jsonify({"error": "Complaint not found"}), 404
        
        return jsonify({
            "success": True,
            "complaint": complaint
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/complaints", methods=["GET"])
def get_all_complaints_admin():
    try:
        complaints = db.get_all_complaints()
        
        return jsonify({
            "success": True,
            "count": len(complaints),
            "complaints": complaints
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/alert", methods=["GET"])
def alert_admin():
    try:
        THRESHOLD = 5  
        
        result, error = db.alert_admin_more_than_threshold(THRESHOLD)
        
        if error:
            return jsonify({"error": error}), 500
        
        if result['should_alert']:
            return jsonify({
                "success": True,
                "alert": True,
                "pending_count": result['pending_count'],
                "threshold": THRESHOLD,
                "message": f"⚠️ ALERT! {result['pending_count']} pending complaints exceed threshold of {THRESHOLD}",
                "complaints": result['complaints']
            })
        else:
            return jsonify({
                "success": True,
                "alert": False,
                "pending_count": result['pending_count'],
                "threshold": THRESHOLD,
                "message": f"No alert. {result['pending_count']} pending complaints (threshold: {THRESHOLD})"
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/complaint/<int:serial_no>/status", methods=["PUT"])
def update_complaint_status(serial_no):
    try:
        status = request.args.get("status", "").lower()
        
        if not status:
            return jsonify({"error": "Status parameter is required"}), 400
        
        if status not in ["pending", "in_progress", "resolved", "rejected"]:
            return jsonify({
                "error": f"Invalid status '{status}'. Valid options: pending, in_progress, resolved, rejected"
            }), 400
        
        success, error = db.update_status(serial_no, status)
        
        if error:
            return jsonify({"error": error}), 400
        
        return jsonify({
            "success": True,
            "message": "Status updated successfully",
            "serial_no": serial_no,
            "new_status": status
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/test")
def test():
    return render_template("test.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)