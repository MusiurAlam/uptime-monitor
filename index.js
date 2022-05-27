
// title
// description 
// author: Musiur 
// date 

// dependencies
const http = require("http");
const {handleReqRes} = require("./helpers/handleReqRes");
const environment = require("./helpers/environment");
// const data = require("./lib/data");

// app object - module scaffolding
const app = {};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(environment.port, () => {
        // eslint-disable-next-line no-undef
        console.log(`environment variable is ${process.env.NODE_ENV} `)
        console.log(`Listening to port ${environment.port}`);
    })
}

// handle request response
app.handleReqRes = handleReqRes;

// start the server 
app.createServer();