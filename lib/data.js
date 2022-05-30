//comment

// dependencies
const fs = require("fs");
const path = require("path");

// module - scaffolding
const lib = {};

// base directory of the data folder
// eslint-disable-next-line no-undef
lib.basedir = path.join(__dirname, "/../.data/");

// write data to file
lib.create = function (dir, file, data, callback) {
  // open file for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "wx",
    function (err1, fileDescriptor) {
      if (!err1 && fileDescriptor) {
        //convert data to string
        const stringData = JSON.stringify(data);

        //write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, function (err2) {
          if (!err2) {
            fs.close(fileDescriptor, function (err3) {
              if (!err3) {
                callback(false);
              } else {
                callback("Error closing the new file!");
              }
            });
          } else {
            callback("Error writing to new file!");
          }
        });
      } else {
        callback("Could not create new file, it may already exists!");
      }
    }
  );
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.basedir + dir + "/" + file + ".json", "utf8", (err, data) => {
    callback(err, data);
  });
};

// update existing file
lib.update = (dir, file, data, callback) => {
  // file open for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "r+",
    (err1, fileDescriptor) => {
      if (!err1 && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        //truncate the file
        fs.ftruncate(fileDescriptor, (err2) => {
          if (!err2) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err3) => {
              if (!err3) {
                // close the file
                fs.close(fileDescriptor, (err4) => {
                  if (!err4) {
                    callback(false);
                  } else {
                    callback("Error closing file!");
                  }
                });
              } else {
                callback("Error writing to file!");
              }
            });
          } else {
            console.log("Error truncating file!");
          }
        });
      } else {
        console.log("Error updating. File may not exist!");
      }
    }
  );
};

// delete existing file
lib.delete = (dir, file, callback) => {
  // unlink file
  fs.unlink(lib.basedir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

// list all the items in a directory
lib.allFiles = (dir, callback) => {
  fs.readdir(lib.basedir + dir + "/", (err, fileNames) => {
    if (
      !err &&
      fileNames &&
      fileNames instanceof Array &&
      fileNames.length > 0
    ) {
      let trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });

      callback(false, trimmedFileNames);
    } else {
      callback("Error reading directory!");
    }
  });
};

module.exports = lib;

// testing file system
// data.create("test", "newFile", {"name": "Bangladesh", "language": "Bangla"}, (err) => {
//     console.log(`error was `, err);
// })

// data.read("test", "newFile", (err, data) => {
//     console.log(err, data);
// })

// data.update("test", "newFile", {"name": "England", "language": "English"}, (err) => {
//     console.log(err);
// })

// data.delete("test", "newFile", (err) => {
//     console.log(err)
// })
