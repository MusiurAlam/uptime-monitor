// comment 

//dependencies
const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");




const routes = {
    sample: sampleHandler,
    notFound: notFoundHandler
}

module.exports = routes;