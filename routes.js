// comment 

//dependencies
const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");
const {userHandler} = require("./handlers/routeHandlers/userHandler");




const routes = {
    sample: sampleHandler,
    notFound: notFoundHandler,
    user: userHandler
}

module.exports = routes;