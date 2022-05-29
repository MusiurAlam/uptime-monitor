// comment

//dependencies
const data = require("../../lib/data");
const { hash, createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");

// module - scaffolding

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptableMethods = ["get", "post", "put", "delete"];

  if (acceptableMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
  // phone
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  // password
  const password =
    typeof requestProperties.queryStringObject.password === "string" &&
    requestProperties.queryStringObject.password.trim().length > 0
      ? requestProperties.queryStringObject.password
      : false;

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      if (!err) {
        let hashedPassword = hash(password);
        if (hashedPassword === parseJSON(userData).password) {
          let tokenId = createRandomString(20);
          let expires = Date.now() + 3600000;
          let tokenObject = {
            phone,
            id: tokenId,
            expires,
          };

          // store the token
          data.create("tokens", tokenId, tokenObject, (err1) => {
            if (!err1) {
              callback(200, tokenObject);
            } else {
              callback(500, {
                error: "There was a problem in server side",
              });
            }
          });
        } else {
          callback(400, {
            error: "Password isn't valid",
          });
        }
      } else {
        callback(500, {
          error: "There was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};
handler._token.get = (requestProperties, callback) => {
  // check the ID number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length > 0
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // loopup the token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested token was not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is problem in your request!",
    });
  }
};
handler._token.put = (requestProperties, callback) => {
  // check the ID number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length > 0
      ? requestProperties.queryStringObject.id
      : false;
  // check the ID number is valid
  const extend =
    typeof requestProperties.queryStringObject.extend === "string" &&
    requestProperties.queryStringObject.extend === "true"
      ? true
      : false;

  if (id && extend) {
    // loop up the tooken
    data.read("tokens", id, (err, tokenData) => {
      if (!err) {
        let tokenInfo = parseJSON(tokenData);
        if (tokenInfo.expires > Date.now()) {
          let updatedTokenInfo = {
            ...tokenInfo,
            expires: Date.now() + 3600000,
          };

          // update token
          data.update("tokens", id, updatedTokenInfo, (err1) => {
            if (!err1) {
              callback(200, {
                message: "Token expiry time extended successfully!",
              });
            } else {
              callback(500, {
                error: "There is a problem in server side!",
              });
            }
          });
        } else {
          callback(400, {
            error: "Token already expired!",
          });
        }
      } else {
        callback(404, {
          error: "Requested token was't found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is a problem in your request!",
    });
  }
};
handler._token.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length > 0
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // loopup ther user
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err1) => {
          if (!err1) {
            callback(200, {
              error: "Token was deleted successfully!",
            });
          } else {
            callback(500, {
              error: "There was a server side error!",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a server side error!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request!",
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// module export
module.exports = handler;
