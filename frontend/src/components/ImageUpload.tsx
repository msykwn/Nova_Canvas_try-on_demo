import React, {useState} from "react";
import {uploadTryOnFile} from "../api/imageUploadService";

import tryOnPicPic from "../resource/try-on.png"
import {executeTryOn, TryOnResult} from "../api/tryOnService.ts";
import Image from "./Image.tsx";

// const generateUniqueId = () => {
//     const timestamp = new Date().getTime();
//     const randomNum = Math.floor(Math.random() * 1000000);
//     return `${timestamp}-${randomNum}`;
// };

const ImageUploadComponent = () => {
    const [modelImage, setModelImage] = useState<File | null>(null);
    const [inputImage, setInputImage] = useState<File | null>(null);
    const [tryOnFile, setTryOnFile] = useState<TryOnResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modelPreview, setModelPreview] = useState<string | null>(null);
    const [inputPreview, setInputPreview] = useState<string | null>(null);

    const handleUpload = async () => {
        try {
            if (!modelImage || !inputImage) {
                alert("画像がセットされていない。。。");
                return
            }
            setIsLoading(true);

            const prepareResult = await uploadTryOnFile(modelImage, inputImage);
            console.log("アップロード完了");

            const tryOnResult = await executeTryOn(prepareResult.modelFileName, prepareResult.inputFileName);
            setTryOnFile(tryOnResult)
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectModel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setModelImage(f);
        const url = URL.createObjectURL(f);
        setModelPreview(url);
    };

    const handleSelectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setInputImage(f);
        const url = URL.createObjectURL(f);
        setInputPreview(url);
    };

    return (
        <div className={"bg-lineBack mx-16 my-8"}>
            <div className={"container bg-lineBack"}>
                <div
                    className="w-full mb-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {/*model 画像*/}
                    <p className="text-lg text-heading">着せ替える人の画像</p>
                    <div className="flex items-center justify-center my-2 mx-8 ">
                        <label htmlFor="dropzone-file-model"
                               className="flex flex-col items-center justify-center w-full h-32 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                            <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                     width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm"><span
                                    className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs">PNG or JPG</p>
                            </div>
                            <input id="dropzone-file-model" type="file" className="hidden"
                                   onChange={handleSelectModel}/>
                        </label>
                    </div>
                    {/*input 画像*/}
                    <p className="text-lg text-heading">着せ替える服の画像</p>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file-input"
                               className="flex flex-col items-center justify-center w-full h-32 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                            <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                     width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm"><span
                                    className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file-input" type="file" className="hidden"
                                   onChange={handleSelectInput}/>
                        </label>
                    </div>
                    {isLoading && (
                        <div
                            className="w-64 mb-3 mx-auto px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">着替え中🐢...</div>
                    )}
                    <div className="flex h-64 w-full">
                        <div className="flex-1 flex items-center justify-center">
                            {modelPreview && (<Image src={modelPreview} id="modelImage" />)}
                        </div>
                            <div className="flex-1 flex items-center justify-center">
                                <Image src={tryOnFile ? tryOnFile.url : tryOnPicPic} id="tryOnImage"/>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                {inputPreview && (<Image src={inputPreview} id="inputImage" />)}
                            </div>
                            </div>
                            <div className="flex items-center justify-center px-3 py-2 border-t dark:border-gray-600">
                                <button
                                    type="submit"
                                    disabled={isLoading || modelImage == null || inputImage == null}
                                    className={"inline-flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"}
                                    onClick={handleUpload}>
                                    着せ替え！
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                );
                };

export {
    ImageUploadComponent
};

ImageUploadComponent.propTypes = {};
