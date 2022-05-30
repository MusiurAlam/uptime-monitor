//comment

//module - scaffolding
const environment = {};

environment.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "opu1",
  maxChecks: 5,
  twilio: {
    fromPhone: "01323260714",
    accountSid: "ACa0d54e284272a887b752fd2ceb5a2936",
    authToken: "55946bbec8ca9168bc9edd0067cc9d0c"
  }
};

environment.production = {
  port: 5000,
  envName: "production",
  secretKey: "opu2",
  maxChecks: 5,
  twilio: {
    fromPhone: "01323260714",
    accountSid: "ACa0d54e284272a887b752fd2ceb5a2936",
    authToken: "55946bbec8ca9168bc9edd0067cc9d0c"
  }
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
