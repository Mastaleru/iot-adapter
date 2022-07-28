const commonServices = require("common-services")
const { DeviceAssignationService, CommunicationService, HealthDataService} = commonServices;
const healthDataService= new HealthDataService();
const deviceAssignationService= new DeviceAssignationService();
const { domainConfig } = require("../../utils/index");

function device_deassignation(message){
    deviceAssignationService.mount(message.ssi, (err, assignDevice) => { 
        if (err){
            console.log(err);
        }
        console.log("********** Device DeAssign **************");
        console.log(assignDevice);
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.deassignDevice(assignDevice, async (error, result)=>{
            if (error) {
                console.log(error);
            }
            
        });
    });
}



module.exports = {
    "device_deassignation": device_deassignation
}