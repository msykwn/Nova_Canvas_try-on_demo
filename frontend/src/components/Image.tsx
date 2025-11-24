export default function  Image({ src, id }: { src: string, id: string}) {
    return (
        <>
            {/* モーダル */}
            <dialog id={id} className="p-0 bg-transparent">
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center"
                    onClick={() => (document.getElementById(id) as HTMLDialogElement).close()}
                >
                    <img
                        src={src}
                        className="max-w-[90%] max-h-[90%] rounded shadow-lg"
                        alt="preview"
                    />
                </div>
            </dialog>

            {/* サムネイル画像 */}
            <img
                src={src}
                className="h-full object-contain"
                onClick={() => (document.getElementById(id) as HTMLDialogElement).showModal()}
                alt=""
            />
        </>
    );
}
