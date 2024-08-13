import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

export function Contact(): ReactNode {
  return (
    <>
      <Helmet>
        <title>Artist Collective | Contact</title>
      </Helmet>
      <div className="absolute left-0 top-0 h-[100vh] w-[100vw] bg-blue-300 pt-nav">
        <a
          href="mailto:alexwaldmann2004@gmail.com"
          className="relative inline-block text-white transition-all duration-300 before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:content-[''] hover:before:w-full"
        >
          Send Us An Email
        </a>
      </div>
    </>
  );
}
