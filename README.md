# AI Civic Agent for City Issues

**Hackathon:** VITAURA 2025 – VIT-AP University
**Date:** 26th October 2025
**Category:** Smart City Automation

---

## Overview

**AI Civic Agent** is an intelligent automation system designed to help municipal and civic departments efficiently manage and respond to citizen-reported city issues.
The system leverages AI to automatically analyze raw citizen inputs—images, text, or descriptions—classify the issue type (e.g., pothole, streetlight failure, garbage overflow), assign a priority score, and route the report to the correct department for action.

This project aims to drastically reduce manual triage time and improve citizen satisfaction through real-time issue categorization, smart routing, and transparent tracking.

---

## Features

* **Automated Issue Classification:** Detects and categorizes problems from uploaded images using pre-trained computer vision models.
* **AI-driven Context Understanding:** Uses LLMs (Gemini + LangChain) to analyze text and extract contextual details like location, severity, and urgency.
* **Priority Scoring System:** Dynamically rates issues based on type, safety impact, and recurrence.
* **Automated Ticket Routing:** Forwards reports to the correct municipal department or volunteer group.
* **Citizen Dashboard:** Allows users to submit and track issues in real-time.
* **Admin Panel:** Lets municipal staff view, filter, and update case statuses efficiently.

---

## Tech Stack

**Frontend:**

* React.js
* Tailwind CSS

**Backend:**

* Python (Flask Framework)
* SQLite (Lightweight Local Database)

**AI & ML Components:**

* **LangChain** – For structured AI workflows and reasoning.
* **Google Gemini** – For language understanding, context analysis, and routing logic.
* **Hugging Face Models** – For image-based issue classification (e.g., potholes, garbage, streetlights).

**Integration:**

* RESTful Flask API connecting backend logic with the React frontend.
* JSON-based endpoints for AI classification, report submission, and ticket updates.

---

## Architecture Overview

1. **User Uploads Report:** Citizen submits a photo and short description.
2. **Image Analysis:** Hugging Face vision model classifies the issue type.
3. **AI Reasoning:** LangChain + Gemini evaluate context and assign a priority score.
4. **Database Storage:** Report details and AI results are saved in SQLite.
5. **Routing:** The system auto-assigns the issue to the right department.
6. **Dashboard Display:** Both citizens and admins can view real-time updates.

---

## Example Workflow

1. User uploads an image of a pothole with a brief note.
2. The backend AI model detects “Pothole – High Severity”.
3. LangChain-Gemini assigns a **priority score: 9/10** and routes it to the **Roads Department**.
4. The admin dashboard displays the issue with location, severity, and suggested action.

---

## 👥 Team Members

| Name                 | GitHub Profile                                                   |
| -------------------- | ---------------------------------------------------------------- |
| **Ganesh M**         | [github.com/prodev717](https://github.com/prodev717)             |
| **Muhammad Sajid Y** | [github.com/muhammadsajidy](https://github.com/muhammadsajidy)   |
| **V K Rohith**       | [github.com/RohiVK](https://github.com/RohiVK)                   |

---

## Team & Acknowledgment

Developed as part of **VITAURA Hackathon 2025 (VIT-AP University)** under the theme *Smart City Automation*.
Team members designed and implemented this solution to modernize civic issue management using AI-driven automation.

---

