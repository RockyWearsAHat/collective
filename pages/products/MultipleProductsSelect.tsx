import { FC, ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";

const MultipleProductSelect: FC = (): ReactNode => {
  const { productName } = useParams();

  const { fn: findProduct } = useMutation({
    url: "/api/products/find",
    method: "POST",
    credentials: "same-origin"
  });

  const [foundProducts, setFoundProducts] = useState<IItem[]>([]);

  const findProducts = async () => {
    const queryFoundProducts = await findProduct({
      productName,
      currentURL: window.location.href
    });
    if (queryFoundProducts?.items) setFoundProducts(queryFoundProducts.items);
  };

  useEffect(() => {
    findProducts();
  }, [window.location.href]);

  return (
    <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
      <h1>Browse Items</h1>
      <button
        onClick={() => {
          foundProducts.forEach(product => console.log(product));
        }}
      >
        Click to display found items
      </button>
    </div>
  );
};

export default MultipleProductSelect;
