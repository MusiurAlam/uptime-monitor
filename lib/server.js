// title
// description
// author: Musiur
// date

// dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environment");

// server object - module scaffolding
const server = {};

// create server
server.createServer = () => {
  const createdServer = http.createServer(server.handleReqRes);

  createdServer.listen(environment.port, () => {
    // eslint-disable-next-line no-undef
    console.log(`environment variable is ${process.env.NODE_ENV} `);
    console.log(`Listening to port ${environment.port}`);
  });
};

// handle request response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
  server.createServer();
};


// module export
module.exports = server;
