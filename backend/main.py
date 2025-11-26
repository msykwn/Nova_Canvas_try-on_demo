import base64
import boto3
import json
import os
import logging

from datetime import datetime
from botocore.exceptions import ClientError

from image_helper import build_inference_params

# ロガーの設定
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Create the Bedrock Runtime client.
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")
s3 = boto3.client("s3")

def create_error_response(status_code, error_message, error_details=None):
    """エラーレスポンスを生成する共通関数"""
    response_body = {
        "error": error_message
    }
    if error_details:
        response_body["details"] = str(error_details)

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps(response_body)
    }

def get_s3_image_base64(bucket, key):
    """S3 の画像を Base64 文字列で取得"""
    obj = s3.get_object(Bucket=bucket, Key=key)
    img_bytes = obj["Body"].read()
    return base64.b64encode(img_bytes).decode("utf-8")

def invoke_api(model, input, mode):
    try:
        bucket_name = os.environ.get("BUCKET_NAME")

        # S3から画像を取得
        try:
            model_image = get_s3_image_base64(bucket_name, model)
            input_image = get_s3_image_base64(bucket_name, input)
        except ClientError:
            return create_error_response(500, "S3から画像の取得に失敗しました")

        # Prepare the invocation payload.
        body_json = json.dumps(build_inference_params(
            model_image,
            input_image,
            mode
        ), indent=2)

        # Invoke Nova Canvas.
        try:
            response = bedrock.invoke_model(
                body=body_json,
                modelId="amazon.nova-canvas-v1:0",
                accept="application/json",
                contentType="application/json"
            )
        except ClientError as e:
            error_message = e.response.get("Error", {}).get("Message", "不明なエラー")
            return create_error_response(500, "画像生成APIの呼び出しに失敗しました", error_message)

        # Extract the images from the response.
        response_body_json = json.loads(response.get("body").read())

        # Check for errors in API response.
        if response_body_json.get("error"):
            error_message = response_body_json.get("error")
            return create_error_response(500, "画像生成中にエラーが発生しました", error_message)

        images = response_body_json.get("images", [])
        if not images:
            return create_error_response(500, "画像が生成されませんでした")

        # Decode each image from Base64 and save as a PNG file.
        for index, image_base64 in enumerate(images):
            image_bytes = base64.b64decode(image_base64)
            file_name = f"output/{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_image.png"

            try:
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
            except ClientError:
                return create_error_response(500, "S3への画像保存に失敗しました")

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*"
                },
                "body": json.dumps({
                    "message": "Try-on successfully",
                    "image_url": presigned_url,
                    "bucket": bucket_name,
                    "key": file_name
                })
            }
            # ローカル用
            # image_buffer = io.BytesIO(image_bytes)
            # image = Image.open(image_buffer)
            # image.save(file_name)

    except Exception as e:
        return create_error_response(500, "予期しないエラーが発生しました", str(e))

def lambda_handler(event, context):
    body = json.loads(event["body"])
    model = body["model"]
    input = body["input"]
    mode = body["mode"]
    return invoke_api(model, input, mode)