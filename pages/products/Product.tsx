import { FC, ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";

const Product: FC = (): ReactNode => {
  const { productName, productID } = useParams();

  const { fn: findProduct } = useMutation({
    url: "/api/products/find",
    method: "POST",
    credentials: "same-origin"
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
      <h1>Product Page</h1>
      <button onClick={() => console.log(foundProduct ? foundProduct : null)}>
        Click to display found item
        {foundProduct ? (
          <div>
            <p>{foundProduct.name}</p>
            <p>{foundProduct.price}</p>
          </div>
        ) : null}
      </button>
    </div>
  );
};

export default Product;
