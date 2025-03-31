import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import PageRouter from "./reactPageRouter";

import { HelmetProvider } from "react-helmet-async";

const helmetContext = {};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider context={helmetContext}>
    <RouterProvider router={PageRouter} />
  </HelmetProvider>
);
