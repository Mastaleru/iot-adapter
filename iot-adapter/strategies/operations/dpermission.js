const commonServices = require("common-services")
const { DPService, CommunicationService} = commonServices;
const dpService = DPService.getDPService();


function create_dp(message) {
    dpService.mount(message.sReadSSI, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        console.log(mountedDPermission);
    });
}


function dp_updated(message) {

    dpService.mount(message.dpUID, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        let matches = mountedDPermission.matches; 
        let match = matches.filter(m => m.study.uid === message.studyUID)[0];
        let researcherDID = match.study.researcherDID;
        let studyUID = match.study.uid;
        let communicationService = CommunicationService.getCommunicationServiceInstance();
        let data = {
            operation: "add_participants_to_study",
            participant: match.patient,
            studyUID: studyUID
        }
        communicationService.sendMessage(researcherDID, data)
    });
}


module.exports = {
    "create_dp": create_dp,
    "dp_updated": dp_updated
}