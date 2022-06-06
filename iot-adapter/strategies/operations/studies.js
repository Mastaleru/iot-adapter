const commonServices = require("common-services")
const { StudiesService } = commonServices;
const studiesService = new StudiesService();
const { domainConfig } = require("../../utils/index");


function new_study(message) {
    studiesService.mount(message.ssi, (err, mountedStudy) => {
        if (err) {
            console.log(err);
        }
        console.log(mountedStudy);
    });
}

module.exports = {
    "new_study": new_study,
}