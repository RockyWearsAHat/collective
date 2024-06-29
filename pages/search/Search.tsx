import { FC, Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/productCard/ProductCard";
import { useMutation } from "../../hooks/useMutation";

export const Search: FC = () => {
  const { productName } = useParams();
  const [products, setProducts] = useState([]);

  const { fn: searchProducts, loading } = useMutation({
    url: `/api/search/${productName}`,
    method: "GET",
    credentials: "same-origin"
  });

  const findAndSetProducts = async () => {
    const data = await searchProducts();
    console.log(data);
    setProducts(data.foundProducts);
  };

  useEffect(() => {
    findAndSetProducts();
  }, [window.location.href]);

  return (
    <div className="absolute left-0 top-12 z-10">
      {/* Loading */}
      {loading && <div className="text-center">Loading...</div>}

      {/* No Products Found */}
      {!loading &&
        (!products ||
          (products.length == 0 && (
            <div className="text-center">No Products Found!</div>
          )))}

      {/* Display Found Products */}
      {!loading && products && products.length > 0 && (
        <div className="flex h-[100vh] w-[100vw] justify-center">
          <ul className="grid-rows-autofit mx-1.5 grid grid-cols-1 justify-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
