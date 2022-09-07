const commonServices = require("common-services")
const { DeviceServices} = commonServices;
const deviceService = new DeviceServices();
const { domainConfig } = require("../../utils/index");

function add_device(message){

    deviceService.mountDevice(message.sReadSSI, (err, mountedDevice) => {
        if (err){
            console.log(err);
        }
        console.log("**************** Data from Clinical Site SSAPP Device  ******************");
        console.log(mountedDevice);

        var deviceData = {
            "resourceType": mountedDevice.resourceType,
            "deviceType": mountedDevice.deviceType,
            "identifier": mountedDevice.identifier,
            "status": mountedDevice.status,
            "manufacturer": mountedDevice.manufacturer,
            "deviceName": mountedDevice.device,
            "modelNumber": mountedDevice.modelNumber,
            "serialNumber": mountedDevice.deviceId,
            "trialUid": mountedDevice.trialUid,
            "isAssigned": mountedDevice.isAssigned,
            "uid": mountedDevice.uid,
            "assignedTo":""
          };
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.createResource("Device", deviceData,(error, result)=>{
            if (error) {
                console.log(error);
            }
            else console.log(result);
        });

    });
}



module.exports = {
    "add_device": add_device,
}