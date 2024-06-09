import express, { Response, Request } from "express";

import { masterAPIRouter } from "./masterAPIRouter";

import cluster from "cluster";
import { cpus } from "os";

import cors from "cors";

//Import connection code from mongoose, self contained so no need to call it, just handle errors and log when server opens
import { db } from "../db/connectToMongo";
import { IUser } from "../db/models/user";

import MongoStore from "connect-mongo";

//Import serverless-http for running in AWS Lambda
import serverless from "serverless-http";

export const app = express();

export const sessionTimeout = 24 * 60 * 60 * 1000;

//Set up session store for cookies and storing JWTs and auth
declare module "express-session" {
  export interface SessionData {
    token: string;
    user: Partial<IUser> | undefined;
    userPFP: string;
  }
}
import expressSession from "express-session";

//Set up express session
const sessionStore = new MongoStore({
  client: db.getClient(),
  dbName: "balls",
  collectionName: "sessions",
  stringify: false,
  autoRemove: "disabled",
  ttl: sessionTimeout
});

app.use(
  expressSession({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    unset: "destroy",
    name: "artistcollective.sid",
    cookie: {
      httpOnly: true,
      sameSite: true,
      secure: false,
      path: "/",
      maxAge: sessionTimeout
    }
  })
);

//Use Cors
app.use(cors({ origin: true, credentials: true }));

//Parse JSON and FormData
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Set up the router for API routes
app.use("/api", masterAPIRouter);

if (process.env !== undefined && process.env["VITE"]) {
  //If running in dev, just run the server from vite, vite plugin to run express is used (SEE vite.config.ts)
  console.log("Running in dev mode");
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
      app.use(express.static(frontendFiles));

      app.get("/*", (_: Request, res: Response) => {
        res.sendFile("index.html", { root: frontendFiles });
      });

      //If running on netlify, server is ran via lamda functions created by serverless-http
      if (!process.env.NETLIFY) {
        app.listen(process.env["PORT"] ? process.env["PORT"] : 4000, () => {
          console.log(
            !process.env["PORT"]
              ? "Server started on http://localhost:4000"
              : ""
          );
        });
      }
    }
  }
}

export const handler = serverless(app);
