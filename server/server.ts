import Express, { Response, Request } from "express";

import apiRouter from "./masterAPIRouter";

import cluster from "cluster";
import { cpus } from "os";

export const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

if (process.env !== undefined && process.env["VITE"]) {
  //If running in dev, just run the server from vite, vite plugin to run express is used (SEE vite.config.ts)
} else {
  //If not running in dev, check how many threads and spawn workers
  if (cluster.isPrimary) {
    const numWorkers = cpus().length;
    console.log(`Master cluster setting up ${numWorkers} workers...`);

    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
      );
      console.log("Starting a new worker");
      cluster.fork();
    });
  } else {
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
  }
}
