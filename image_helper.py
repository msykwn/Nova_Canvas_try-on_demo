import base64
def load_image_as_base64(image_path):
    """画像データを準備するためのヘルパー関数"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
inference_params = {
    "taskType": "VIRTUAL_TRY_ON",
    "virtualTryOnParams": {
        "sourceImage": load_image_as_base64("model.png"),
        "referenceImage": load_image_as_base64("input.png"),
        "maskType": "GARMENT",
        "garmentBasedMask": {
            "garmentClass": "FULL_BODY"
        }
    },
    "imageGenerationConfig": {
        "quality": "standard"
    }
}