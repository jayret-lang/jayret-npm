var childProcess = require("child_process");
var fs = require("fs");

function checkErr(result) {
  if(result.status !== 0) {
    console.error(result.error);
    process.exit(result.status);
  }
}

if (!fs.existsSync("jarret-lang")) {
  var cloneResult = childProcess.spawnSync("git", ["clone", "--single-branch", "--branch", "jarret-v0.1.0", "https://github.com/ulysses4ever/jarret-lang.git"], {'stdio': 'inherit'});
  checkErr(cloneResult);
}

/*
checkErr(childProcess.spawnSync("npm", ["install"], {'stdio': 'inherit', 'cwd': "jarret-lang"}));
checkErr(childProcess.spawnSync("make", ["-C", "jarret-lang", "phaseA", "libA"], {'stdio': 'inherit'}));
*/
