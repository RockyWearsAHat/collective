import { FC, ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";

export const Product: FC = (): ReactNode => {
  const { productName, productID } = useParams();

  const { fn: findProduct } = useMutation({
    url: "/api/products/find",
    method: "POST",
    credentials: "same-origin"
  });

  const { fn: addItemToCart } = useMutation({
    url: "/api/cart/addToCart",
    method: "POST",
    credentials: "same-origin"
  });

  const { fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST"
  });

  const { fn: logCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  const [foundProduct, setFoundProduct] = useState<IItem>();

  const findProducts = async () => {
    const queryFoundProducts = await findProduct({
      productName,
      productID,
      currentURL: window.location.href
    });
    if (queryFoundProducts?.item) setFoundProduct(queryFoundProducts.item);
  };

  useEffect(() => {
    findProducts();
  }, [window.location.href]);

  return (
    <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
      {foundProduct && (
        <>
          {foundProduct.imageLinks && foundProduct.imageLinks.length > 0 && (
            <div>
              <img src={`${foundProduct.imageLinks[0]}`} className="w-24" />
              <h1>{foundProduct.name}</h1>
              <div className="flex flex-col items-start">
                <button
                  onClick={() => {
                    addItemToCart({ productToAdd: foundProduct._id });
                  }}
                >
                  Add to cart
                </button>
                <button
                  onClick={() => {
                    removeItemFromCart({ productToRemove: foundProduct._id });
                  }}
                >
                  Remove from cart
                </button>
                <button
                  onClick={async () => {
                    console.log(await logCart());
                  }}
                >
                  Log Cart
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
