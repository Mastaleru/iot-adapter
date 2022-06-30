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
        let studyUID = match.studyUID;
        studiesService.getStudy(studyUID, (err, studyFullData)=>{
            if (err) {
                console.log(err);
            }
            let researcherDID = studyFullData.researcherDID;
            let requestedDataType = studyFullData.data;
            let communicationService = CommunicationService.getCommunicationServiceInstance();
            let data = {
                operation: "add_participants_to_study",
                participant: match.patient,
                studyUID: match.studyUID,
                dpermissionStartSharingDate: match.dpermissionStartSharingDate,
                dpermission: match.dpermission
            }
            communicationService.sendMessage(researcherDID, data);
            console.log("ADD: Updating the D Permission in the researcher SSAPP");
            
            // Send data sReadSSI back to researcher
        
            healthDataService.getAllObservations((err, allPatientsObservations)=>{
                if (err){
                    return console.log(err);
                }

                let collectedObservations = [];

                allPatientsObservations.forEach(patientObservations => {
                    patientObservations.forEach(observation => {
                        let patientTPNumber = observation.subject.reference.slice(8);
                        let observationDataType = observation.code.text;
                        if (patientTPNumber === data.participant.patientTPNumber &&  observationDataType === requestedDataType) {
                            collectedObservations.push(observation)

                            permissionedHealthDataService.getAllObservations((err, data)=> {
                                if (err) {
                                    console.log(err);
                                }
                                console.log(data);
                                console.log("permissioned data here");
                            });
                            //console.log("found")
                            //console.log(patientObservations.uid)

                            // healthDataService.updateObservation(observation, (err, data)=>{
                            //     if (err) {
                            //         console.log(err);
                            //     }
                            //     console.log(data);
                            // })

                            // path = '/health-data'
                            // healthDataService.getSReadSSI(path, (err, data)=> {
                            //     if (err){
                            //         console.log(err);
                            //     }
                            //     console.log(data);
                            //     healthDataService.mountObservation(data, (err, mountedData)=> {
                            //         if (err){
                            //             console.log(err);
                            //         }
                            //         console.log(mountedData);
                            //     })
                            // })
                            //return false;
                        }
                    });
                });
                console.log(collectedObservations);
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