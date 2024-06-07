import { ReactNode, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useMutation } from "../../hooks/useMutation";

export function Home(): ReactNode {
  const { fn: addItemToCart } = useMutation({
    url: "/api/cart/addToCart",
    method: "POST",
    credentials: "same-origin"
  });

  const { loading: removeItemLoading, fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST"
  });

  const { fn: logCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  return (
    <>
      <Helmet>
        <title>Artist Collective | Home</title>
      </Helmet>
      <div className="absolute left-10 top-10 z-10">
        <button
          onClick={async () =>
            await addItemToCart({ productToAdd: "664943ff5fdc05ba00fb4508" })
          }
        >
          Add new item to cart
        </button>
        <br />
        <button
          onClick={async () => {
            await removeItemFromCart({
              productToRemove: "664943ff5fdc05ba00fb4508"
            });
          }}
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
