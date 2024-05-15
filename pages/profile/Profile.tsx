import { ReactNode, useContext, useState } from "react";
import { ActiveContext } from "../app/App";
// import ImageEditor from "../../components/imageEditor/ImageEditor";

export default function Profile(): ReactNode {
  const [profilePhoto, setProfilePhoto] = useState<File>();
  const { setActive } = useContext(ActiveContext);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profilePhoto) return;

    const formData = new FormData();
    formData.append("newPFP", profilePhoto);

    await fetch("/api/user/savePFP", {
      method: "POST",
      body: formData
    });

    //Reload navbar to show new profile photo
    setActive("/profilePhotoChanged");
  };

  return (
    <div className="h-[100vh] pt-nav">
      <form
        onSubmit={handleFileUpload}
        encType="multipart/form-data"
        className="pt-4"
      >
        <label
          htmlFor="pfpUploadBtn"
          className="rounded-md bg-slate-600 p-4 text-white hover:cursor-pointer"
        >
          Choose New Profile Image
        </label>
        <input
          id="pfpUploadBtn"
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) setProfilePhoto(e.target.files[0]);
          }}
        />
        <button type="submit">Upload</button>
        {/* <ImageEditor file={profilePhoto} setTarget={setProfilePhoto} /> */}
      </form>
    </div>
  );
}
