import { FC, ReactNode, useState } from "react";
import { Config, removeBackground } from "@imgly/background-removal";

interface ImageEditorProps {}

const BackgroundRemovalConfig: Config = {
  device: "gpu",
  model: "isnet_quint8",
  output: {
    format: "image/png",
    quality: 1
  }
};

const ImageEditor: FC<ImageEditorProps> = (): ReactNode => {
  const [image, setImage] = useState<File>();

  return (
    <>
      <input
        id="imageEditorFileInput"
        type="file"
        accept="image/*"
        onChange={() => {
          const fileInput = document.getElementById(
            "imageEditorFileInput"
          ) as HTMLInputElement;
          if (fileInput.files && fileInput.files[0]) {
            let tempFile = fileInput.files[0];
            removeBackground(
              URL.createObjectURL(tempFile),
              BackgroundRemovalConfig
            ).then(blob => {
              tempFile = new File([blob], tempFile.name, { type: blob.type });
              setImage(tempFile);
            });
          }
        }}
      />

      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Uploaded Image"
          className="max-h-[500px] max-w-[500px]"
        />
      )}
    </>
  );
};

export default ImageEditor;
