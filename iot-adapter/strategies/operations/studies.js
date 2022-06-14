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
        //console.log("looking for this data: ", mountedStudy.data)

        healthDataService.getAllObservations((err, allPatientsObservations)=>{
            if (err){
                return console.log(err);
            }
            //console.log("All patients with data are: ", allPatientsObservations.length);
            allPatientsObservations.forEach(patientObservations => {
                //console.log("observations for this patient are: ", patientObservations.length)
                patientObservations.forEach(observation => {
                    let patientTPNumber = observation.subject.reference.slice(8);
                    let patientDataType = observation.code.text;
                    if (patientDataType === mountedStudy.data ) {
                        let candidatePatientFound = {
                            patientTPNumber: patientTPNumber,
                            patientDataType: patientDataType
                        };
                        candidatePatientsFound.push(candidatePatientFound);
                    }
                });
            });

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
                    })
                })
                console.log(`Candidate patients found: ${JSON.stringify(candidatePatientsFound)}`);

                dpService.getDPs((err, data) => {
                    if (err){
                        console.log(err);
                    }
                    DPs = data;
                    DPs.forEach(dp => {
                        //console.log(dp)
                        candidatePatientsFound.forEach(patient => {
                            // console.log(dp.tp.did);
                            // console.log(patient.patientDID);
                            if ((dp.tp.did === patient.patientDID) && (dp.perm.wantToShare===true) ) {
                                // console.log(dp.perm.wantToShare);
                                // console.log(patient.patientTPNumber);
                                // console.log(patient)
                                let communicationService = CommunicationService.getCommunicationServiceInstance();
                                let data = {
                                    operation: "DataMatchMaking",
                                    patient: patient,
                                    study: mountedStudy
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