import React, { useState } from "react";

import { ActiveContext } from "../contextProvider";

import "../globals.css";

import "../tailwindOutput.css";

import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

const App: React.FC = () => {
  const [active, setActive] = useState<string>("");
  const activePageContextValue = { active, setActive };

  return (
    <React.StrictMode>
      <HelmetProvider>
        <ActiveContext.Provider value={activePageContextValue}>
          <Navbar />
          <Outlet />
        </ActiveContext.Provider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

export default App;
