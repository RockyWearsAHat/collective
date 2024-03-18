//This file is how ALL DIFFERENT ROUTES FOR TSX PAGES (VIEWS) are defined, the entry point for node is server.ts
//however once server.ts serves the index.html file, the client.tsx file takes over and renders the routes while
//hono continues to serve backend routes for the application

//No idea on if this is efficient at all, or if the hono routes can be deployed to cloudflare or anything that would
//make them any faster than just writing all the backend handler routes in something like react-router-dom or next.js route
//handlers, where the routes get packed into the same "server" (not true, with next.js they're hosted on cloudflare just with
//an upcharge), but still in order to get this to work to correctly with the setup of React + Hono, and serve multiple react files,
//react router must be used because hono only understands to send the index.html file to all routes that that are not caught by
//a direct handler, this index.html file then calls the client.tsx entry point for the react app, which will then create the
//wrappers/context/everything else for the react app, then finally render pages

import { createBrowserRouter } from "react-router-dom";

import Home from "./home/Home";
import Contact from "./contact/Contact";
import Login from "./login/Login";
import Upload from "./upload/Upload";
import Profile from "./profile/Profile";
import Logout from "./logout/Logout";
import App from "./app/App";

const PageRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        path: "/",
        element: <Home />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/create",
        element: <Upload />
      },
      {
        path: "/logout",
        element: <Logout />
      }
    ]
  }
]);

export default PageRouter;
