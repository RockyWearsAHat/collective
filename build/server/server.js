import Express from 'express';
import router from './masterAPIRouter.js';
import cluster from 'cluster';
import { cpus } from 'os';

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use("/api", router);
if (process.env !== undefined && process.env["VITE"]) ;
else {
    //If not running in dev, check how many threads and spawn workers
    if (cluster.isPrimary) {
        const numWorkers = cpus().length;
        console.log(`Master cluster setting up ${numWorkers} workers...`);
        for (let i = 0; i < numWorkers; i++) {
            cluster.fork();
        }
        cluster.on("exit", (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
            console.log("Starting a new worker");
            cluster.fork();
        });
    }
    else {
        if (!process.env["VITE"]) {
            const frontendFiles = process.cwd() + "/build/";
            app.use(Express.static(frontendFiles));
            app.get("/*", (_, res) => {
                res.sendFile("index.html", { root: frontendFiles });
            });
            app.listen(process.env["PORT"] ? process.env["PORT"] : 4000);
            console.log(!process.env["PORT"] ? "Server started on http://localhost:4000" : "");
        }
    }
}

export { app };
//# sourceMappingURL=server.js.map
