const commonServices = require("common-services")
const { StudiesService, HealthDataService, DeviceAssignationService, DPService, CommunicationService } = commonServices;
const { domainConfig } = require("../../utils/index");
const Constants = commonServices.Constants;
const studiesService = new StudiesService();
const healthDataService= new HealthDataService();
const deviceAssignationService = new DeviceAssignationService();
const dpService = DPService.getDPService();

var DPs, candidatePatientsFound, candidatesToCommunicate;


function communicate_study_data_matchmaking(message) {

    candidatePatientsFound = [];
    DPs = [];
    candidatesToCommunicate= [];

    studiesService.mount(message.ssi, (err, mountedStudy) => {
        if (err) {
            console.log(err);
        }
        console.log("looking for this data: ", mountedStudy.data)

        healthDataService.getAllObservations((err, allPatientsObservations)=>{
            if (err){
                return console.log(err);
            }

            mountedStudy.data.forEach(datatype => {
                allPatientsObservations.forEach(patientObservations => {
                    console.log(patientObservations.observations.length);
                    patientObservations.observations.every(observation => {
                        let patientTPNumber = observation.subject.reference.slice(8);
                        let patientDataType = observation.code.text;
                        if (patientDataType === datatype ) {
                            let candidatePatientFound = {
                                patientTPNumber: patientTPNumber,
                                patientDataType: mountedStudy.data
                            };
                            candidatePatientsFound.push(candidatePatientFound);
                            return false;
                        }
                        return true;
                    });
                });

            })


            deviceAssignationService.getAssignedDevices((err, data)=> {
                if (err){
                    console.log(err);
                }
                data.forEach(assignedDevice => {
                    candidatePatientsFound.forEach(patient => {
                        if (assignedDevice.trialParticipantNumber === patient.patientTPNumber) {
                            patient.patientDID = assignedDevice.patientDID
                            patient.deviceId = assignedDevice.deviceId
                        }
                    });
                });

                console.log(`Candidate patients found:\n ${JSON.stringify(candidatePatientsFound, null, 4)}`);

                let keys = ['patientDID'];
                candidatesToCommunicate = candidatePatientsFound.filter(
                    (s => o => 
                        (k => !s.has(k) && s.add(k))
                        (keys.map(k => o[k]).join('|'))
                    )
                    (new Set)
                );

                dpService.getDPs((err, data) => {
                    if (err){
                        console.log(err);
                    }
                    DPs = data;
                    DPs.forEach(dp => {
                        candidatesToCommunicate.forEach(patient => {
                            if ((dp.tp && dp.tp.did === patient.patientDID) && (dp.contactMe === true) && (patient.patientDID !== undefined)) {
                                console.log(`Candidate patient that wants to share found: ${JSON.stringify(patient.patientTPNumber)}`);
                                let communicationService = CommunicationService.getCommunicationServiceInstance();
                                let data = {
                                    operation: Constants.MESSAGES.RESEARCHER.DATA_MATCH_MAKING,
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
    "communicate_study_data_matchmaking": communicate_study_data_matchmaking,
}
