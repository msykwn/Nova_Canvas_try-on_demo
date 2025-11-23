export interface TryOnResult {
    fileName: string;
    url: string;
}

/**
 * きせかえを実施し、生成された画像のファイル名とURLを返却する
 */
export const executeTryOn = async (modelImageUrl: String, inputImageUrl: String): Promise<TryOnResult> => {
    const res = await fetch("https://uur25qs2q8.execute-api.ap-northeast-1.amazonaws.com/prod/try-on", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            model: modelImageUrl,
            input: inputImageUrl,
        }),
    });

    if (!res.ok) {
        throw new Error(`試着に失敗しました`);
    }

    const { image_url, key } = await res.json();
    return {
        fileName: key,
        url: image_url
    };
};
