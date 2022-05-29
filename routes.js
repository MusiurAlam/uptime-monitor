// comment 

//dependencies
const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");
const {userHandler} = require("./handlers/routeHandlers/userHandler");
const {tokenHandler} = require("./handlers/routeHandlers/tokenHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandlers");





const routes = {
    sample: sampleHandler,
    notFound: notFoundHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
}

module.exports = routes;