import json
import boto3
import os

s3 = boto3.client('s3')
BUCKET = os.environ.get("BUCKET_NAME")

def lambda_handler(event, context):
    body = json.loads(event["body"])
    filename = body["filename"]
    content_type = body["contentType"]

    put_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET,
            "Key": filename,
            "ContentType": content_type
        },
        ExpiresIn=300  # 5分
    )
    get_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": BUCKET,
            "Key": filename        },
        ExpiresIn=3600  # 1時間
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps({"put_url": put_url, "get_url": get_url})
    }
