import base64
import boto3
import json
import os

from datetime import datetime

from image_helper import build_inference_params

# Create the Bedrock Runtime client.
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")
s3 = boto3.client("s3")

def get_s3_image_base64(bucket, key):
    """S3 の画像を Base64 文字列で取得"""
    obj = s3.get_object(Bucket=bucket, Key=key)
    img_bytes = obj["Body"].read()
    return base64.b64encode(img_bytes).decode("utf-8")

def invoke_api(model, input):
    bucket_name = os.environ.get("BUCKET_NAME")
    # Prepare the invocation payload.
    body_json = json.dumps(
        build_inference_params(get_s3_image_base64(bucket_name, model),
                               get_s3_image_base64(bucket_name, input)
                               ), indent=2)
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
        file_name = f"output/image_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.png"

        s3.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=image_bytes,
            ContentType="image/png"
        )

        presigned_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket_name, "Key": file_name},
            ExpiresIn=3600  # 秒（1時間）
        )

        return {
            "statusCode": 200,
            "message": "Image uploaded successfully",
            "image_url": presigned_url,
            "bucket": bucket_name,
            "key": file_name
        }
        # ローカル用
        # image_buffer = io.BytesIO(image_bytes)
        # image = Image.open(image_buffer)
        # image.save(file_name)

def lambda_handler(event, context):
    model = event.get('model')
    input = event.get('input')
    return invoke_api(model, input)