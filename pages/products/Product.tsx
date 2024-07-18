import { FC, ReactNode, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";
import { ActiveContext } from "../contextProvider";
import { FiMinus, FiPlus } from "react-icons/fi";

export const Product: FC = (): ReactNode => {
  const { productName, productID } = useParams();
  const { setActive } = useContext(ActiveContext);

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

  const { fn: getCart } = useMutation({
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
    setActive("product");
    findProducts();
  }, [window.location.href]);

  const [productQuantity, setProductQuantity] = useState<number | null>(1);

  const [addingProduct, setAddingProduct] = useState<boolean>(false);
  const [removingProduct, setRemovingProduct] = useState<boolean>(false);

  const addRemoveProductButtonDelay = 100;

  useEffect(() => {
    setTimeout(() => {
      const quantityInput = document.getElementById("quantityInput");
      console.log(quantityInput);
      if (!quantityInput) return;
      quantityInput;
    }, 1000);
  }, []);

  return (
    <div className="absolute left-0 top-0 grid h-[100vh] w-[100vw] px-2 pt-12 lg:grid-cols-2">
      {foundProduct && (
        <>
          {foundProduct.imageLinks && foundProduct.imageLinks.length > 0 && (
            <>
              <div className="flex items-center justify-center">
                <img
                  src={`${foundProduct.imageLinks[0]}`}
                  className="h-[calc(100vh-4rem)]"
                />
              </div>
              <div>
                <h1>{foundProduct.name}</h1>
                <div className="flex flex-col items-start">
                  <button
                    disabled={addingProduct}
                    onClick={async () => {
                      setAddingProduct(true);
                      await addItemToCart({
                        productToAdd: foundProduct._id,
                        quantity: productQuantity
                      });
                      setActive("itemAddedToCart");
                      setTimeout(() => {
                        setAddingProduct(false);
                      }, addRemoveProductButtonDelay);
                    }}
                  >
                    Add to cart
                  </button>
                  <button
                    disabled={removingProduct}
                    onClick={async () => {
                      setRemovingProduct(true);
                      await removeItemFromCart({
                        productToRemove: foundProduct._id,
                        quantity: productQuantity
                      });
                      setActive("itemAddedToCart");
                      setTimeout(() => {
                        setRemovingProduct(false);
                      }, addRemoveProductButtonDelay);
                    }}
                  >
                    Remove from cart
                  </button>
                  <div>
                    <h2>Quantity: </h2>
                    <div className="relative flex w-[fit-content] items-center justify-around after:absolute after:left-0 after:top-[95%] after:h-[2px] after:w-full after:bg-black">
                      <button
                        onClick={() => {
                          if (productQuantity !== null && productQuantity > 1)
                            setProductQuantity(productQuantity - 1);
                        }}
                      >
                        <FiMinus />
                      </button>
                      <span
                        id="quantityInput"
                        className="w-[fit-content] text-center"
                        role="textbox"
                        inputMode="numeric"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          if (
                            e.target.innerHTML == null ||
                            e.target.innerHTML == ""
                          )
                            setProductQuantity(1);
                          else {
                            setProductQuantity(parseInt(e.target.innerHTML));
                          }
                        }}
                      >
                        {productQuantity}
                      </span>
                      <button
                        onClick={() => {
                          if (productQuantity == null) setProductQuantity(1);
                          else setProductQuantity(productQuantity + 1);
                        }}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      console.log(await getCart());
                    }}
                  >
                    Log Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
