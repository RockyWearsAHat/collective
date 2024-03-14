import Express, { Response, Request } from "express";

import apiRouter from "./masterAPIRouter";

export const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

if (!process.env["VITE"]) {
  const frontendFiles = process.cwd() + "/build/";
  app.use(Express.static(frontendFiles));

  app.get("/*", (_: Request, res: Response) => {
    res.sendFile("index.html", { root: frontendFiles });
  });
  app.listen(process.env["PORT"] ? process.env["PORT"] : 4000);
  console.log(
    !process.env["PORT"] ? "Server started on http://localhost:4000" : ""
  );
}
