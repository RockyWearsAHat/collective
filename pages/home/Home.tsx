import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
// import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ImageScroller } from "../../components/imageScroller/imageScroller";
import { Link } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
// import { useMutation } from "../../hooks/useMutation";

export function Home(): ReactNode {
  // const { fn: logout } = useMutation({
  //   url: "/api/user/logout",
  //   method: "GET"
  // });

  const { fn: uploadItemImages } = useMutation({
    url: "/api/products/uploadItemImages",
    method: "POST"
  });

  const [productImages, setProductImages] = useState<File[]>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productImages || productImages.length == 0) return;

    console.log(productImages);
    const formData = new FormData();
    formData.append("newImage", productImages[0]);

    console.log(formData);

    const res = await uploadItemImages({ formData, productId: "6655423b5fa5778f9079f71c" });
    console.log(res);
  };

  return (
    <>
      <Helmet>
        <title>Artist Collective | Home</title>
      </Helmet>
      <div id="rootContainer" className="h-[100vh] w-[100vw] overflow-y-auto pt-10">
        <div>
          <h1 className="text-4xl">Most Popular</h1>
          <ImageScroller searchQuery={{ timesPurchased: -1 }} maximumItems={30} chunkSize={10} />

          <h1 className="text-4xl">Newest</h1>
          <ImageScroller searchQuery={{ dateAdded: -1 }} maximumItems={30} chunkSize={10} />
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <form onSubmit={handleFileUpload} encType="multipart/form-data" className="pt-4">
            <label
              htmlFor="productImageUploadBtn"
              className="rounded-md bg-slate-600 p-4 text-white hover:cursor-pointer"
            >
              Choose New Product Image
            </label>
            <input
              id="productImageUploadBtn"
              className="hidden"
              type="file"
              accept="image/*, .heic"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  // let fileList = e.target.files;
                  // setProductImage(e.target.files[0]);
                  // setProductImages(fileList);
                }
              }}
            />
            <button type="submit">Upload</button>
          </form>
        </div>
      </div>
    </>
  );
}
