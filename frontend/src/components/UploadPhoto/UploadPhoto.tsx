import React, {HTMLAttributes, useRef} from 'react';
import './UploadPhoto.scss';
import {FaPhotoFilm} from "react-icons/fa6";
import {Overlay} from "@/prefabs/container-prefabs";
import {PrefabIconButton} from "@/prefabs/button-prefabs";
import {FormFileRef} from "@/types/form-file";
import {MdFileOpen} from "react-icons/md";

export function getBase64FromFile(file: File) {
    return new Promise((resolve: (value: string | ArrayBuffer) => void, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64 = reader.result;
            resolve(base64!);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

let instance = 0;

export default function UploadPhoto(props: {
    className?: string,
    src: string,
    id?: string,
    onUpload: (file: FormFileRef) => void,
    onReset?: () => void,
    children?: React.ReactElement,
    overlay?: boolean,
    style?: HTMLAttributes<HTMLDivElement>['style']
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const id = props.id ?? `photo_upload_${instance++}`;

    const handleUpload = async (file: File) => {
        let base64: string | ArrayBuffer = '';
        try {
            base64 = await getBase64FromFile(file);
        } catch {
        }

        props.onUpload(new FormFileRef({
            id: `${new Date().getTime() + Math.floor(Math.random() * 10_000_000)}`,
            file,
            fileName: file.name,
            ext: file.name.split('.').pop() ?? '',
            blobUrl: URL.createObjectURL(file),
            base64
        }));
    }

    const handleChange = () => {
        if (!fileInput.current?.files) return;
        handleUpload(fileInput.current.files[0]).then();
    };

    const className = 'w-full border rounded-lg overflow-hidden';
    const style = props.style ?? {};
    if (!style.height) style.height = 160;

    return (
        <div className={`flex-col relative ${className} ${props.className ?? ''}`}
             style={style}>
            <Overlay className={'z-[1] flex-center full'}>
                {props.src ? (
                    <>
                        <img className={'relative full'} style={{objectFit: 'cover'}} src={props.src} alt="picture"/>
                    </>
                ) : props.children ?? (
                    <FaPhotoFilm size={32}/>
                )}
            </Overlay>

            <input
                id={id}
                name={id}
                type="file"
                ref={fileInput}
                style={{display: 'none'}}
                onChange={handleChange}
            />
            <label htmlFor={id} className={'full z-[2]'}/>

            <label htmlFor={id} className={'absolute z-[3] p-2 flex full items-end justify-end bg-background/20 '}>
                <PrefabIconButton className={'bg-background'}>
                    <MdFileOpen size={18}/>
                </PrefabIconButton>
            </label>
        </div>
    );
};
