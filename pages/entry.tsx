import ReactDOM from "react-dom/client";

import React from "react";
import { RouterProvider } from "react-router-dom";
import PageRouter from "./reactPageRouter";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={PageRouter} />
  </React.StrictMode>
);
