import { bindChanges } from "../../components/monitorEventEmitter";

var normalizedPath = require("path").join(__dirname, "../changes");

const changes = require("fs").readdirSync(normalizedPath).map(function(file) {
  return require("../changes/" + file).default;
});

export default bindChanges(changes)