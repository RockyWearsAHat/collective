import Express from 'express';
import router from './masterAPIRouter.js';

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use("/api", router);
if (!process.env["VITE"]) {
    const frontendFiles = process.cwd() + "/build/";
    app.use(Express.static(frontendFiles));
    app.get("/*", (_, res) => {
        res.sendFile("index.html", { root: frontendFiles });
    });
    app.listen(process.env["PORT"] ? process.env["PORT"] : 4000);
    console.log(!process.env["PORT"] ? "Server started on http://localhost:4000" : "");
}

export { app };
//# sourceMappingURL=server.js.map
