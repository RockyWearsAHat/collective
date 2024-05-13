import React, { SetStateAction, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import "../globals.css";

import "../tailwindOutput.css";
import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

interface ActiveContextInterface {
  active: string;
  setActive: React.Dispatch<SetStateAction<string>>;
}

export const ActiveContext = React.createContext<ActiveContextInterface>({
  active: "",
  setActive: () => {}
});

const App: React.FC = () => {
  const [active, setActive] = useState<string>("/");
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
