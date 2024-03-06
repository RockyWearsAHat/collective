const logRouteNotFound = async (c) => {
    //Split the URL to get the route http:[0] /[1] /[2] /route[3]
    const queryURL = "/" + c.req.url.split("/").slice(3).join("/");
    console.log(queryURL.indexOf("/api"));
    return c.json({
        message: `${queryURL.indexOf("/api") != -1 ? "API " : ""}Route ${queryURL} with method ${c.req.method} not found!`,
    });
};

export { logRouteNotFound };
//# sourceMappingURL=middlewares.js.map
