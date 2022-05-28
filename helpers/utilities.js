//comment

//dependencies
const crypto = require("crypto");
const environment = require("./environment");

//module scaffolding

const utilities = {};

// parse JSON string to Object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};

// hashing
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", environment.secretKey)
      .update(str)
      .digest("Hex");

    return hash;
  } else {
    return false;
  }
};

// export module
module.exports = utilities;
