const commonServices = require("common-services")
const { DPService, CommunicationService, StudiesService, HealthDataService, PermissionedHealthDataService} = commonServices;
const dpService = DPService.getDPService();
const studiesService = new StudiesService();
const healthDataService= new HealthDataService();
const permissionedHealthDataService = new PermissionedHealthDataService();

function create_dp(message) {
    dpService.mount(message.sReadSSI, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        console.log(mountedDPermission);
    });
}


function dp_updated_add(message) {

    dpService.mount(message.dpUID, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        let matches = mountedDPermission.matches; 
        let match = matches.filter(m => m.studyUID === message.studyUID)[0];
        let matchTPNumber = match.patient.patientTPNumber;
        let studyUID = match.studyUID;

        studiesService.getStudy(studyUID, (err, studyFullData)=>{
            if (err) {
                console.log(err);
            }
            let researcherDID = studyFullData.researcherDID;
            let requestedDataType = studyFullData.data;
           
            // Find avaiable Data and Create  Permissioned data DSU
            healthDataService.getAllObservations((err, allPatientsObservations)=>{
                if (err){
                    return console.log(err);
                }
                let collectedObservations = [];
                allPatientsObservations.forEach(patientObservations => {
                    patientObservations.observations.forEach(observation => {
                        let patientTPNumber = observation.subject.reference.slice(8);
                        let observationDataType = observation.code.text;
                        if (patientTPNumber === matchTPNumber &&  observationDataType === requestedDataType) {
                            observation.subject.reference = match.patient.patientDID;
                            observation.studyUID = message.studyUID;
                            observation.objectId = "N/A";
                            observation.sk = "N/A";
                            observation.identifier = "N/A";
                            collectedObservations.push(observation)
                        }
                    });
                });
                permissionedHealthDataService.saveObservation(collectedObservations, (err, savedData)=> {
                    if (err){
                        console.log(err);
                    }
                    let PermissionState = {
                        operation: "add_participants_to_study",
                        participant: match.patient,
                        studyUID: match.studyUID,
                        dpermissionStartSharingDate: match.dpermissionStartSharingDate,
                        dpermission: match.dpermission,
                        permissionedDataDSUSSI: savedData.sReadSSI
                    }
                    let communicationService = CommunicationService.getCommunicationServiceInstance();
                    communicationService.sendMessage(researcherDID, PermissionState);
                    console.log(savedData);
                    console.log("Generated %d anonymized observations for this participant.", savedData.length);
                    console.log("ADD: New permission and permissioned data DSU to the researcher");
                });
            });
        })
    });
}

function dp_updated_remove(message) {

    dpService.mount(message.dpUID, (err, mountedDPermission) => {
        if (err) {
            console.log(err);
        }
        let matches = mountedDPermission.matches; 
        let match = matches.filter(m => m.studyUID === message.studyUID)[0];
        let studyUID = match.studyUID;
        studiesService.getStudy(studyUID, (err, studyFullData)=>{
            if (err) {
                console.log(err);
            }
            let researcherDID = studyFullData.researcherDID;
            let communicationService = CommunicationService.getCommunicationServiceInstance();
            let data = {
                operation: "remove_participants_from_study",
                participant: match.patient,
                studyUID: match.studyUID,
                dpermissionStopSharingDate: match.dpermissionStopSharingDate,
                dpermission: match.dpermission
            }
            communicationService.sendMessage(researcherDID, data);
            console.log("REMOVE: Updating the D Permission in the researcher SSAPP");
        })
    });
}


module.exports = {
    "create_dp": create_dp,
    "dp_updated_add": dp_updated_add,
    "dp_updated_remove": dp_updated_remove
}