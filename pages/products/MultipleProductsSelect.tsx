import { FC, Key, ReactNode, useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";
import ProductCard from "../../components/productCard/ProductCard";
import { ObjectId } from "mongoose";
import { ActiveContext } from "../contextProvider";
import { Helmet } from "react-helmet-async";

export const MultipleProductSelect: FC = (): ReactNode => {
  const { productName } = useParams();
  const { setActive } = useContext(ActiveContext);

  const { fn: findProduct } = useMutation({
    url: "/api/products/find",
    method: "POST",
    credentials: "same-origin"
  });

  const [foundProducts, setFoundProducts] = useState<IItem[] | null>(null);

  const findProducts = async () => {
    const queryFoundProducts = await findProduct({
      productName,
      currentURL: window.location.href
    });
    if (queryFoundProducts?.items) setFoundProducts(queryFoundProducts.items);
  };

  useEffect(() => {
    setActive("products");
    findProducts();
  }, [window.location.href]);

  return (
    <>
      <Helmet>
        <title>Artist Collective | Browse Products</title>
      </Helmet>
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
        <h1>Browse Items</h1>
        <div className="flex gap-5">
          {foundProducts &&
            foundProducts.map((item: IItem, index) => {
              return (
                <ProductCard
                  id={item._id as ObjectId}
                  key={index as Key}
                  name={item.name}
                  image={item.imageLinks![0]}
                  price={item.price as string}
                  salePrice={
                    item.salePrice != ""
                      ? (item.salePrice as string)
                      : undefined
                  }
                />
              );
            })}
        </div>
      </div>
    </>
  );
};
