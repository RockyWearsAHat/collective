import { ReactNode, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useMutation } from "../../hooks/useMutation";

export default function Home(): ReactNode {
  const { fn: addItemToCart } = useMutation({
    url: "/api/cart/addToCart",
    method: "POST",
    credentials: "same-origin"
  });

  const { loading: removeItemLoading, fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST",
    credentials: "same-origin"
  });

  const { fn: logCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET",
    credentials: "same-origin"
  });

  return (
    <>
      <Helmet>
        <title>Artist Collective | Home</title>
      </Helmet>
      <div className="absolute left-10 top-10 z-50">
        <button
          onClick={() =>
            addItemToCart({ productToAdd: "6635e0c40aaae30d3da434fe" })
          }
        >
          Add new item to cart
        </button>
        <br />
        <button
          onClick={() =>
            removeItemFromCart({ productToRemove: "662c40606b247846a4a17eda" })
          }
          disabled={removeItemLoading}
          className="bg-red-500 disabled:bg-red-300"
        >
          Remove item from cart
        </button>
        <br />
        <button
          onClick={async () => {
            console.log(await logCart());
          }}
        >
          Log Cart
        </button>
      </div>
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
    </>
  );
}
