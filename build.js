var childProcess = require("child_process");
var fs = require("fs");

function checkErr(result) {
  if(result.status !== 0) {
    console.error(result.error);
    process.exit(result.status);
  }
}

if (!fs.existsSync("jayret-lang")) {
  var cloneResult = childProcess.spawnSync("git", ["clone", "--single-branch", "--branch", "jayret-v0.1.0", "https://github.com/ulysses4ever/jayret-lang.git"], {'stdio': 'inherit'});
  checkErr(cloneResult);
}

/*
checkErr(childProcess.spawnSync("npm", ["install"], {'stdio': 'inherit', 'cwd': "jayret-lang"}));
checkErr(childProcess.spawnSync("make", ["-C", "jayret-lang", "phaseA", "libA"], {'stdio': 'inherit'}));
*/
