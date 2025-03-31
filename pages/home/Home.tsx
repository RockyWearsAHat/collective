import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
// import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ImageScroller } from "../../components/imageScroller/imageScroller";
import { Link } from "react-router-dom";
// import { useMutation } from "../../hooks/useMutation";

export function Home(): ReactNode {
  // const { fn: logout } = useMutation({
  //   url: "/api/user/logout",
  //   method: "GET"
  // });

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
          <Link to="/browse/popular">Browse Popular</Link>
        </div>
      </div>
    </>
  );
}
