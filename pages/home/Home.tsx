import { ReactNode /*Suspense*/ } from "react";
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
      {/* <Parallax pages={2}>
        <ParallaxLayer speed={1}>
          <div
            className={`flex h-[100vh] w-[100vw] cursor-default select-none flex-col justify-center text-center text-white`}
          >
            <h1 className="text-4xl">Welcome</h1>
          </div>
        </ParallaxLayer>
        <Suspense>
          <ParallaxLayer
            speed={0.25}
            className="absolute top-0 -z-50 h-[100vh] w-[100vw] bg-[url('/bg.jpg')]"
          />
        </Suspense>
      </Parallax> */}
      <div className="flex h-[100vh] w-[100vw] justify-center bg-white align-middle">
        <div className="max-w-[95%] self-center">
          <ImageScroller searchQuery={{ timesAddedToCart: -1 }} maximumItems={30} chunkSize={10}></ImageScroller>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <Link to="/browse/popular">Browse Popular</Link>
        </div>
      </div>
      {/* <button
        onClick={async () => {
          await logout();
        }}
      >
        Logout
      </button> */}
    </>
  );
}
