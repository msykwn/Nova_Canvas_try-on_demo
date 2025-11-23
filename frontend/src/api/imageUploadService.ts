// src/api/imageUploadService.ts

export interface UploadResult {
    modelFileName: string;
    modelUrl: string;
    inputFileName: string;
    inputUrl: string;
}

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

    const uploadRes = await fetch(put_url, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: file,
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
    const modelUrl = await uploadFileToS3(modelImage, "model/" + `${timestamp}_${modelImage.name}`);
    const inPutUrl = await uploadFileToS3(inputImage, "input/" +`${timestamp}_${inputImage.name}`);

    return {
        modelFileName: modelImage.name,
        modelUrl: modelUrl,
        inputFileName: inputImage.name,
        inputUrl: inPutUrl
    };
};
