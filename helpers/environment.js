//comment

//module - scaffolding
const environment = {};

environment.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "opu1",
  maxChecks: 5
};

environment.production = {
  port: 5000,
  envName: "production",
  secretKey: "opu2",
  maxChecks: 5
};

//determine which environment was passed
const currentEnvironment =
  // eslint-disable-next-line no-undef
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// export corresponding environment object
const environmentToExport =
  typeof environment[currentEnvironment] === "object"
    ? environment[currentEnvironment]
    : environment.staging;

//export module
module.exports = environmentToExport;
