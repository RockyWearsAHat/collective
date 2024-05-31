import { FC, ReactNode, useState } from "react";

interface ImageEditorProps {
  file: File | undefined;
  setTarget: (file: File) => void;
}

const ImageEditor: FC<ImageEditorProps> = ({ file, setTarget }): ReactNode => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const handleBrightnessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    setBrightness(value);
  };

  const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setContrast(value);
  };

  const handleSaturationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    setSaturation(value);
  };

  if (!file) return null;

  return (
    <div>
      <img
        id="img"
        src={URL.createObjectURL(file)}
        alt="Image"
        style={{
          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
        }}
      />
      <div>
        <label htmlFor="brightness">Brightness:</label>
        <input
          type="range"
          id="brightness"
          min="0"
          max="200"
          value={brightness}
          onChange={handleBrightnessChange}
        />
      </div>
      <div>
        <label htmlFor="contrast">Contrast:</label>
        <input
          type="range"
          id="contrast"
          min="0"
          max="200"
          value={contrast}
          onChange={handleContrastChange}
        />
      </div>
      <div>
        <label htmlFor="saturation">Saturation:</label>
        <input
          type="range"
          id="saturation"
          min="0"
          max="200"
          value={saturation}
          onChange={handleSaturationChange}
        />
      </div>
      <img src="" id="modifiedImage" />
      <button
        type="submit"
        onClick={async () => {
          const img: HTMLImageElement | null = document.getElementById(
            "img"
          ) as HTMLImageElement | null;
          if (!img) return;
          const src = await fetch(img.src);
          const blob = await src.blob();
          const modifiedFile = new File([blob], file.name, blob);

          (document.getElementById("modifiedImage") as HTMLImageElement)!.src =
            URL.createObjectURL(modifiedFile);

          setTarget(modifiedFile);
        }}
      >
        Finish Selection and Upload
      </button>
    </div>
  );
};

export default ImageEditor;
