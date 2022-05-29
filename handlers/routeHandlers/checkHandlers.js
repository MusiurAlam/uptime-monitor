// comment

//dependencies
const data = require("../../lib/data");
const { createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environment");

// module - scaffolding

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptableMethods = ["get", "post", "put", "delete"];

  if (acceptableMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  // validation
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["https", "http"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const acceptableMethods = ["get", "post", "put", "delete"];
  let method =
    typeof requestProperties.body.method === "string" &&
    acceptableMethods.indexOf(requestProperties.body.method.toLowerCase()) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone number by reading the token
    data.read("tokens", token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        let userPhone = parseJSON(tokenData).phone;

        //lookup the user data
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // save the object
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      // add check id to the user's object

                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err4) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem in server side!",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in server side!",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "User has already five checks!",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication failed!",
                });
              }
            });
          } else {
            callback(403, {
              error: "Authentication failed!",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed!",
        });
      }
    });
  } else {
    callback(500, {
      error: "There is a problem in your request!",
    });
  }
};
handler._check.get = (requestProperties, callback) => {
  // check the ID number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // loopup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const check = { ...parseJSON(checkData) };
        // verify token
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, parseJSON(checkData));
          } else {
            callback(403, {
              error: "Authentication failed!",
            });
          }
        });
      } else {
        callback(404, {
          error: "Requested check was not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is problem in your request!",
    });
  }
};
handler._check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  // validation
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["https", "http"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const acceptableMethods = ["get", "post", "put", "delete"];
  let method =
    typeof requestProperties.body.method === "string" &&
    acceptableMethods.indexOf(requestProperties.body.method.toLowerCase()) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          const check = parseJSON(checkData);

          // verify token
          let token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              //   callback(200, parseJSON(checkData));
              if (protocol) {
                check.protocol = protocol;
              }
              if (url) {
                check.url = url;
              }
              if (method) {
                check.method = method;
              }
              if (successCodes) {
                check.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                check.timeoutSeconds = timeoutSeconds;
              }

              // update the store object and save that in database
              data.update("checks", id, check, (err1) => {
                if (!err1) {
                  callback(200, {
                    message: "Check updated successfully!",
                  });
                } else {
                  callback(500, {
                    error: "There is problem in server side!",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication failed!",
              });
            }
          });
        } else {
          callback(500, {
            error: "There is problem in server side!",
          });
        }
      });
    } else {
      callback(400, {
        error: "There is problem in your request!",
      });
    }
  } else {
    callback(400, {
      error: "There is problem in your request!",
    });
  }
};
handler._check.delete = (requestProperties, callback) => {
  // check the ID number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // loopup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const check = { ...parseJSON(checkData) };
        // verify token
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // delete the check data
            data.delete("checks", id, (err1) => {
              if (!err1) {
                data.read("users", check.userPhone, (err2, userData) => {
                  if (!err2 && userData) {
                    let userObject = parseJSON(userData);

                    let userChecks =
                      typeof userObject.checks === "object" &&
                      userObject.checks instanceof Array
                        ? userObject.checks
                        : [];

                    if (userChecks.length) {
                      // remove the deleted check id from user's list of checks
                      let checkPosition = userChecks.indexOf(id);
                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);

                        // resave the user data
                        userObject.checks = userChecks;
                        data.update(
                          "users",
                          userObject.phone,
                          userObject,
                          (err3) => {
                            if (!err3) {
                              callback(200, {
                                message: "Check deleted successfully!",
                              });
                            } else {
                              callback(500, {
                                err3,
                                error: "There was a server side problem!",
                              });
                            }
                          }
                        );
                      } else {
                        callback(404, {
                          error: "No checks found!",
                        });
                      }
                    } else {
                      callback(404, {
                        error: "No checks found!",
                      });
                    }
                  } else {
                    callback(500, {
                        err2,
                      error: "There was a server side problem!",
                    });
                  }
                });
              } else {
                callback(500, {
                  error: "There was a server side problem!",
                });
              }
            });
          } else {
            callback(403, {
              error: "Authentication failed!",
            });
          }
        });
      } else {
        callback(404, {
          error: "Requested check was not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is problem in your request!",
    });
  }
};

module.exports = handler;
