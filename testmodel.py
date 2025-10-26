from gradio_client import Client, handle_file
import httpx

client = Client("PatientZero6969/civic-issue-image-classifier",httpx_kwargs={"timeout": httpx.Timeout(60.0, connect=60.0)})
result = client.predict(
	image=handle_file('test-images/pothole.jpg'),
	api_name="/predict_issue"
)
print(result)