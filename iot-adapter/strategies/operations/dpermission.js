const commonServices = require("common-services")
const { DPService} = commonServices;

const dpService = DPService.getDPService();

function create_dp(message) {
    dpService.mount(message.sReadSSI, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        console.log(mountedDPermission);
    });
}

module.exports = {
    "create_dp": create_dp,
}