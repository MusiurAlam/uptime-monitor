// comment

//dependencies
const { parseJSON } = require("../helpers/utilities");
const data = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");
const { sendTwilioSms } = require("../helpers/notifications");

// module scaffolding
const worker = {};

//lookup all th checks
worker.gatherAllChecks = () => {
  //get all the checks
  data.allFiles("checks", (err, checks) => {
    if (!err && checks && checks instanceof Array && checks.length > 0) {
      checks.forEach((check) => {
        //read the check data
        data.read("checks", check, (err1, checkData) => {
          if (!err1 && checkData) {
            // pass the check data to the next process
            // validator
            worker.validateCheckData(parseJSON(checkData));
          } else {
            console.log("Error in reading one of the checks data!");
          }
        });
      });
    } else {
      console.log("Couldn't not find any checkes to process!");
    }
  });
};

// validate check data
worker.validateCheckData = (checkData) => {
  if (checkData && checkData.id) {
    let originalData = { ...checkData };
    originalData.state =
      typeof originalData.state === "string" &&
      ["up", "down"].indexOf(originalData.state) > -1
        ? originalData.state
        : "down";

    originalData.lastCheck =
      typeof originalData.lastCheck === "number" && originalData > 0
        ? originalData.lastCheck
        : false;

    // pass to the next process;
    worker.performCheck(originalData);
  } else {
    console.log("Error in check data reading!");
  }
};

// perform check
worker.performCheck = (checkData) => {
  // prepare the initial check outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  let outcomeSent = false;
  // parse the checkData
  const parseUrl = url.parse(checkData.protocol + "://" + checkData.url, true);

  const { hostname, path } = parseUrl;

  // construct the request
  const requestDetails = {
    protocol: checkData.protocol + ":",
    hostname,
    method: checkData.method.toUpperCase(),
    path,
    timeout: checkData.timeoutSeconds * 1000,
  };

  const protocolToUse = checkData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    checkOutCome.responseCode = status;
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // check error
  req.on("error", (err) => {
    let checkOutCome = {
      error: true,
      value: err,
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // timeout error
  req.on("timeout", () => {
    let checkOutCome = {
      error: true,
      value: "timeout",
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // req send
  req.end();
};

// save check outcome to database and esnt to next process
worker.processCheckOutcome = (checkData, checkOutCome) => {
  // check if cehck outcome is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    checkData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  // decide whether we should alert theuser or not
  let alertWanted = !!(checkData.lastCheck && checkData.state !== state);

  //update the check data
  let newCheckData = {...checkData};
  newCheckData.state = state;
  newCheckData.lastCheck = Date.now();

  // update the check to disk
  data.update("checks", checkData.id, newCheckData, (err) => {
      if(!err){
        // send the alert
        if(alertWanted){
            worker.alertUserToStatusChange(newCheckData);
        }else{
            console.log("No need of alert!")
        }
      }else{
          console.log("Error in trying to update check data of one of the checks!")
      }
  })
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    let message = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, message, (err) => {
        if(!err){
            console.log(`user was alerted to a status change via SMS: ${message}`)
        }else{
            console.log("There was a problem sending sms to one of the user!")
        }
    });
}

// timer to execute the worker process once per miniute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 8000);
};

// start the workers
worker.init = () => {
  // execute all the cheks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};

// export

module.exports = worker;
