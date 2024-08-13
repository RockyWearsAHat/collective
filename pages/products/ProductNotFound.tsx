import { FC, ReactNode, useEffect, useContext } from "react";
import { ActiveContext } from "../contextProvider";
import { Helmet } from "react-helmet-async";

export const ProductNotFound: FC = (): ReactNode => {
  const { setActive } = useContext(ActiveContext);
  useEffect(() => {
    setActive("productNotFound");
  }, []);
  return (
    <>
      <Helmet>
        <title>Artist Collective | Contact</title>
      </Helmet>
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
        <h1>Product Not Found!</h1>
      </div>
    </>
  );
};
