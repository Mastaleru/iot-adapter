const commonServices = require("common-services")
const { StudiesService, HealthDataService, DeviceAssignationService, DPService, CommunicationService } = commonServices;
const { domainConfig } = require("../../utils/index");

const studiesService = new StudiesService();
const healthDataService= new HealthDataService();
const deviceAssignationService = new DeviceAssignationService();
const dpService = DPService.getDPService();

var DPs, candidatePatientsFound;


function new_study(message) {

    candidatePatientsFound = [];
    DPs = [];

    studiesService.mount(message.ssi, (err, mountedStudy) => {
        if (err) {
            console.log(err);
        }
        console.log("looking for this data: ", mountedStudy.data)

        healthDataService.getAllObservations((err, allPatientsObservations)=>{
            if (err){
                return console.log(err);
            }
            allPatientsObservations.forEach(patientObservations => {
                console.log(patientObservations.observations.length);
                patientObservations.observations.every(observation => {
                    let patientTPNumber = observation.subject.reference.slice(8);
                    let patientDataType = observation.code.text;
                    if (patientDataType === mountedStudy.data ) {
                        let candidatePatientFound = {
                            patientTPNumber: patientTPNumber,
                            patientDataType: patientDataType
                        };
                        candidatePatientsFound.push(candidatePatientFound);
                        return false;
                    }
                    return true;
                });
            });

            deviceAssignationService.getAssignedDevices((err, data)=> {
                if (err){
                    console.log(err);
                }
                data.forEach(assignedDevice => {
                    candidatePatientsFound.forEach(patient => {
                        // TODO #436 - @Rafael, please validate
                        if (patient.patientTPNumber === assignedDevice.trialParticipantNumber) {
                            patient.patientDID = assignedDevice.patientDID
                            patient.deviceId = assignedDevice.deviceId
                        }
                    });
                });

                console.log(`Candidate patients found: ${JSON.stringify(candidatePatientsFound)}`);

                dpService.getDPs((err, data) => {
                    if (err){
                        console.log(err);
                    }
                    DPs = data;
                    DPs.forEach(dp => {
                        candidatePatientsFound.forEach(patient => {
                            if ((dp.tp && dp.tp.did === patient.patientDID) && (dp.contactMe === true) && (patient.patientDID !== undefined)) {
                                console.log(`Candidate patient that wants to share found: ${JSON.stringify(patient.patientTPNumber)}`);
                                let communicationService = CommunicationService.getCommunicationServiceInstance();
                                let data = {
                                    operation: "datamatchmaking",
                                    patientInformation: patient,
                                    studysReadSSI: message.ssi
                                }
                                communicationService.sendMessage(patient.patientDID, data)
                            }
                        })
                    })
                });
            })
        })
    });

}

module.exports = {
    "new_study": new_study,
}
