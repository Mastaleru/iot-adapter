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

function list_device(message){
    let flow = $$.flow.start(domainConfig.type);
    flow.init(domainConfig);
    flow.searchResources("Device", (error, result)=>{
        if (error) {
            console.log(error);
        }
        else console.log(result);
    });
    
}
function update_device(message){
    deviceService.mountDevice(message.sReadSSI, (err, mountedDevice) => {
        if (err){
            console.log(err);
        }
        const entityId = mountedDevice.objectId;
        console.log(mountedDevice);
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.updateResource("Device", entityId,  mountedDevice , (error, result) => {
            if (error) {
                console.log(error.status, error);
            } else {
                console.log(result);
            }
        });

    });
}

function get_a_device(message){
    deviceService.mountDevice(message.ssi, (err, mountedEntity) => {
        if (err){
            console.log(err);
        }
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.getResourceById("Device", mountedEntity.objectId, (error, result)=>{
            if (error) {
                console.log(error);
            }
            else console.log(result);
        });
    });
}

function delete_device(message){
    console.log("**************** Delete Device Function  ******************");
    // console.log(message);
    let flow = $$.flow.start(domainConfig.type);
    flow.init(domainConfig);
    flow.getDeviceByUID(message.uid, (error, deviceData)=>{
        console.log(deviceData);
        if (error) {
            console.log(error);
        }
        else {
            let test = deviceData.results;
            let data = test[0];
            console.log(data.objectId)
            flow.deleteResource("Device",data.objectId, (error, result)=>{
                if (error) {
                    console.log(error);
                }
                else console.log(result);
            });
        }
    });
    

    
}

module.exports = {
    "add_device": add_device,
    "list_device":list_device,
    "update_device":update_device,
    "get_a_device":get_a_device,
    "remove_device":delete_device
}