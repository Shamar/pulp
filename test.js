var exec = require("./exec");
var path = require("path");
var log = require("./log");
var files = require("./files");

module.exports = function(pro, args, callback) {
  log("Building project in", process.cwd());
  var done = function(err, rv) {
    if (err) return callback(err);
    log("Tests OK.");
    callback();
  };
  if (args.testRuntime) {
    if (!args.to) args.to = "./output/test.js";
    exec.psc(
      [files.src, files.test, files.deps],
      [files.srcForeign, files.testForeign, files.depsForeign],
      ["-o", args.to, "--main=" + args.main],
      null, function(err, rv) {
        if (err) return callback(err);
        log("Build successful. Running tests...");
        exec.exec(
          args.testRuntime, false, [args.to].concat(args.remainder),
          process.env, done
        );
      }
    );
  } else {
    exec.pscMake(
      [files.src, files.test, files.deps],
      [files.srcForeign, files.testForeign, files.depsForeign],
      ["-o", args.buildPath], null, function(err, rv) {
        if (err) return callback(err);
        log("Build successful. Running tests...");
        var buildPath = path.resolve(args.buildPath);
        exec.exec(
          "node", false,
          ["-e", "require('" + args.main + "').main()"].concat(args.remainder),
          {
            PATH: process.env.PATH,
            NODE_PATH: buildPath + ":" + process.env.NODE_PATH
          }, done
        );
      }
    );
  }
};
