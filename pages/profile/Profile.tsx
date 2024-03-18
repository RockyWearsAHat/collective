import { ReactNode, useState } from "react";

export default function Profile(): ReactNode {
  const [profilePhoto, setProfilePhoto] = useState<File>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profilePhoto) return;

    const formData = new FormData();
    formData.append("newPFP", profilePhoto);

    await fetch("/api/user/savePFP", {
      method: "POST",
      body: formData
    });
  };

  return (
    <div className="pt-nav">
      <form onSubmit={handleFileUpload} encType="multipart/form-data">
        <input
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) setProfilePhoto(e.target.files[0]);
          }}
        />
        <button type="submit">Upload New Profile Photo</button>
      </form>
    </div>
  );
}
