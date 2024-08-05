import { ReactNode, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useMutation } from "../../hooks/useMutation";

export function Home(): ReactNode {
  const { fn: logout } = useMutation({
    url: "/api/user/logout",
    method: "POST"
  });

  return (
    <>
      <Helmet>
        <title>Artist Collective | Home</title>
      </Helmet>
      <Parallax pages={2}>
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
      </Parallax>
      <div className="flex h-[100vh] w-[100vw] justify-center bg-black align-middle">
        <div className="self-center">
          <h1>Hello</h1>
        </div>
      </div>
      <button
        onClick={async () => {
          await logout();
        }}
      >
        Logout
      </button>
    </>
  );
}
