const commonServices = require("common-services")
const { DeviceAssignationService, CommunicationService, HealthDataService} = commonServices;
const healthDataService= new HealthDataService();
const deviceAssignationService= new DeviceAssignationService();
const { domainConfig } = require("../../utils/index");

function device_assignation(message){
    deviceAssignationService.mount(message.ssi, (err, assignDevice) => { 
        if (err){
            console.log(err);
        }
        // console.log("********* Device Assigned **********")
        // console.log(assignDevice)
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.assignDevice(assignDevice, async (error, result)=>{

            if (error) {
                console.log(error);
            }
            else 
            {
                
                flow.getObservationsByTrialParticipantNumber("Observation", assignDevice.trialParticipantNumber, (err, observations)=>{
                    if(err){
                        console.log(err.message);
                    }
                    else{                        
                        healthDataService.saveObservation(observations.results, (err, data)=> {
                            if(err){
                                console.log(err.message);
                            }
                            const communicationService = CommunicationService.getCommunicationServiceInstance();
                            communicationService.sendMessage(assignDevice.patientDID, { 
                                operation: "HealthData",
                                sReadSSI: data.sReadSSI
                            });
                        });
                    }
                });
                
            }
        });
    });
}



module.exports = {
    "device_assignation": device_assignation
}