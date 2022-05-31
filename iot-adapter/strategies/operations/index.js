const evidences = require("./evidences.js");
const devices = require("./devices.js");
const deviceAssignation = require("./deviceAssignation.js");

module.exports = {
    ...evidences,
    ...devices,
    ...deviceAssignation
}