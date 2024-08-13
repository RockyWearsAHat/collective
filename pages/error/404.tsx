import React from "react";
import Navbar from "../../components/navbar/Navbar";
import { Helmet } from "react-helmet-async";

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Artist Collective | Page Not Found</title>
      </Helmet>
      <Navbar />
      <div className="flex h-screen flex-col items-center justify-center bg-slate-600">
        <div className="flex flex-col justify-center self-center align-middle text-white">
          <h1>Oops, sorry! something went wrong!</h1>
          <h1 className="text-6xl">404 Page Not Found</h1>
          <a href="/" className="mt-6 text-center">
            Back Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
