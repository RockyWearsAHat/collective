import React, { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { ActiveContext } from "../contextProvider";

import "../globals.css";

import "../tailwindOutput.css";
import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

const App: React.FC = () => {
  const [active, setActive] = useState<string>("");
  const activePageContextValue = { active, setActive };

  return (
    <>
      <HelmetProvider>
        <ActiveContext.Provider value={activePageContextValue}>
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
          <Navbar />
          <Outlet />
        </ActiveContext.Provider>
      </HelmetProvider>
    </>
  );
};

export default App;
