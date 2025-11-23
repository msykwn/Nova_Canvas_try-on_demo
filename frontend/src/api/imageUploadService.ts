export interface UploadResult {
    modelFileName: string;
    modelUrl: string;
    inputFileName: string;
    inputUrl: string;
}

const MAX_PIXELS = 2048 * 2048; // Nova Canvas 最大ピクセル数

const now = new Date();
const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0") +
    "_" +
    String(now.getMilliseconds()).padStart(3, "0");

const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const totalPixels = width * height;

                if (totalPixels > MAX_PIXELS) {
                    const scale = Math.sqrt(MAX_PIXELS / totalPixels);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, "image/png");
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

/**
 * アップロード用のURLを生成後、そのURLへファイルをアップロードし、URLを返却します。
 * @param file
 * @param path
 */
async function uploadFileToS3(file: File, path: String) {

    const preSignRes = await fetch("https://uur25qs2q8.execute-api.ap-northeast-1.amazonaws.com/prod/prepare", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            filename: path,
            contentType: file.type,
        }),
    });

    if (!preSignRes.ok) {
        throw new Error(`presigned URL の取得に失敗しました`);
    }

    const { put_url, get_url } = await preSignRes.json();

    const resizedFile = await resizeImage(file);

    const uploadRes = await fetch(put_url, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: resizedFile,
    });

    if (!uploadRes.ok) {
        throw new Error(`S3 アップロードに失敗しました (${file.name})`);
    }
    return get_url;
}

/**
 * 着せ替えようファイルをアップロードする
 * アップロードした画像のファイル名とURLを返却する
 */
export const uploadTryOnFile = async (modelImage: File, inputImage: File): Promise<UploadResult> => {
    const modelPath = "model/" + `${timestamp}_${modelImage.name}`
    const inputPath = "input/" + `${timestamp}_${inputImage.name}`

    const modelUrl = await uploadFileToS3(modelImage, modelPath);
    const inPutUrl = await uploadFileToS3(inputImage, inputPath);

    return {
        modelFileName: modelPath,
        modelUrl: modelUrl,
        inputFileName: inputPath,
        inputUrl: inPutUrl
    };
};
