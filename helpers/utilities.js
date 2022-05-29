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

// string hashing
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

//create random string
utilities.createRandomString = (stringLength) => {
  let length = stringLength;
  length =
    typeof stringLength === "number" && stringLength > 0 ? stringLength : false;

  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz01234567890";

    let output = "";

    for (let i = 1; i <= length; i++) {
      let randomCaracter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCaracter;
    }

    return output;
  } else {
    return false;
  }
};

// export module
module.exports = utilities;
