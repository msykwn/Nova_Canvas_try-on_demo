import base64
import io
import json

import boto3
from PIL import Image

from image_helper import inference_params

# Create the Bedrock Runtime client.
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")

# Prepare the invocation payload.
body_json = json.dumps(inference_params, indent=2)
# print(body_json)
# Invoke Nova Canvas.
response = bedrock.invoke_model(
    body=body_json,
    modelId="amazon.nova-canvas-v1:0",
    accept="application/json",
    contentType="application/json"
)

# Extract the images from the response.
response_body_json = json.loads(response.get("body").read())
images = response_body_json.get("images", [])

# Check for errors.
if response_body_json.get("error"):
    print(response_body_json.get("error"))

# Decode each image from Base64 and save as a PNG file.
for index, image_base64 in enumerate(images):
    image_bytes = base64.b64decode(image_base64)
    image_buffer = io.BytesIO(image_bytes)
    image = Image.open(image_buffer)
    image.save(f"image_{index}.png")
