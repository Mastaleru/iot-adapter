const devices = require("./devices.js");
const deviceAssignation = require("./deviceAssignation.js");
const deAssignDevice = require("./deAssignDevice.js");
const dpermission = require("./dpermission.js");
const studies = require("./studies");

module.exports = {
    ...devices,
    ...deviceAssignation,
    ...deAssignDevice,
    ...dpermission,
    ...studies
}