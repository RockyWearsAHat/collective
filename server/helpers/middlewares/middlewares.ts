import { Request, Response } from "express";

export const logRouteNotFound = async (req: Request, res: Response) => {
  //Split the URL to get the route http:[0] /[1] /[2] /route[3]
  const queryURL = "/" + req.url.split("/").slice(3).join("/");
  console.log(queryURL.indexOf("/api"));
  return res.json({
    message: `${
      queryURL.indexOf("/api") != -1 ? "API " : ""
    }Route ${queryURL} with method ${req.method} not found!`
  });
};
