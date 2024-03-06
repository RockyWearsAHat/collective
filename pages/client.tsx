import React from "react";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";

//Get our page router from reactPageRouter.tsx, this defines all client side pages/routes, how a typed route should render if it has a view
import PageRouter from "./reactPageRouter";
import "./globals.css";

//Include tailwindcss
import "./tailwindOutput.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <React.StrictMode>
      <HelmetProvider>
        <Helmet>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        <PageRouter />
      </HelmetProvider>
    </React.StrictMode>
  </>
);
