import { FC, Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/productCard/ProductCard";
import { useMutation } from "../../hooks/useMutation";

export const Search: FC = () => {
  const { productName } = useParams();
  const [products, setProducts] = useState([]);
  let tempProducts: any = [];

  const { fn: searchProducts, loading } = useMutation({
    url: `/api/search/${productName}`,
    method: "GET",
    credentials: "same-origin"
  });

  const findAndSetProducts = async () => {
    setProducts([]);
    tempProducts = null;
    const data = await searchProducts();
    tempProducts = data.foundProducts;
    setProducts(data.foundProducts);
  };

  useEffect(() => {
    findAndSetProducts();
  }, [window.location.href]);

  return (
    <div className="absolute left-0 top-0 z-10 pb-2 pt-12">
      {/* Loading */}
      {loading && <div className="text-center">Loading...</div>}

      {/* No Products Found */}
      {/* THIS IS A WILD CHECK, idk what this is, I do but wtf. State setting is async, therefore tempProducts null | array
      check to see if something was found by the fetch before the state updates, once state updates rerender happens,
      if there are products, it will display, if not, it flashes "No Products Found!" before displaying the found products 
      without tempProducts check */}
      {!loading &&
        (tempProducts == null ||
          (tempProducts instanceof Array && tempProducts.length == 0)) &&
        (!products ||
          (products.length == 0 && (
            <div className="text-center">No Products Found!</div>
          )))}

      {/* Display Found Products */}
      {tempProducts && !loading && products && products.length > 0 && (
        <div className="flex h-auto w-[100vw] justify-center">
          <ul className="mx-1.5 grid grid-cols-1 grid-rows-autofit justify-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product: any, i) => (
              <Fragment key={i}>
                <ProductCard
                  key={i}
                  name={product.name}
                  id={product._id}
                  image={product.imageLinks[0]}
                  price={product.price}
                  salePrice={product.salePrice ? product.salePrice : null}
                />
              </Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
