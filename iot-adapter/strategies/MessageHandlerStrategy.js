const commonServices = require("common-services")
const {EvidenceService, CommunicationService, DeviceServices} = commonServices;

async function messageHandlerStrategy(message) {

    try {
        message = JSON.parse(message);
    } catch (e) {
        console.error(e);
        throw e;
    }

    const communicationService = CommunicationService.getCommunicationServiceInstance();
    const evidenceService = new EvidenceService();
    const deviceService = new DeviceServices();

    switch (message.operation) {
        /**  Start Message Service for Evidence */
        case "new_evidence":
            evidenceService.mount(message.ssi, (err, mountedEntity) => {
                if (err){
                    console.log(err);
                }
                console.log("**************** Data from Researcher SSAPP  ******************");
                console.log(mountedEntity);
                const domainConfig = {
                    "type": "IotAdaptor",
                    "option": {
                        "endpoint": "http://localhost:3000/iotAdapter"
                    }
                }
                let flow = $$.flow.start(domainConfig.type);
                flow.init(domainConfig);
                const dbName = "clinicalDecisionSupport";
                var evidenceData = {
                    "resourceType": "Evidence",
                    "meta": {
                        "sk": mountedEntity.uid
                    },
                    "identifier": [ {
                        "type": {
                            "text": "KeySSI"
                          },
                        "use": "secondary",
                        "system": "https://pharmaledger.eu",
                        "value": mountedEntity.uid
                    } ],
                    "title": mountedEntity.title,
                    "subtitle": mountedEntity.subtitle,
                    "description": mountedEntity.description,
                    "version": mountedEntity.version,
                    "status": mountedEntity.status,
                    "exposureBackground": {

                    },
                    "topic": [
                        {
                        "text": mountedEntity.topic
                        }
                    ]
                  };

                flow.createResource("Evidence", evidenceData,(error, result)=>{
                    if (error) {
                        console.log(error);
                    }
                    else console.log(result);
                });
            });
            break;

            case "list_evidences":
                {
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.searchResources("Evidence", (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else console.log(result);
                    });
                }
            break;

            case "get_a_evidence":
                evidenceService.mount(message.ssi, (err, mountedEntity) => {
                    if (err){
                        console.log(err);
                    }
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.getResourceById("Evidence", mountedEntity.objectId, (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else console.log(result);
                    });
                });
            break;

            case "update_evidence":
            console.log(message);
            deviceService.mountDevice(message.sReadSSI, (err, mountedDevice) => {
                if (err){
                    console.log(err);
                }
                const entityId = mountedDevice.objectId;
                console.log(mountedDevice);
                const domainConfig = {
                    "type": "IotAdaptor",
                    "option": {
                        "endpoint": "http://127.0.0.1:3000/adaptor"
                    }
                };
                let flow = $$.flow.start(domainConfig.type);
                flow.init(domainConfig);
                flow.updateResource("Evidence", entityId,  mountedDevice , (error, result) => {
                    if (error) {
                        console.log(error.status, error);
                    } else {
                        console.log(result);
                    }
                });

            });
            break;

            case "delete_evidence":
                evidenceService.mount(message.ssi, (err, mountedEntity) => {
                    if (err){
                        console.log(err);
                    }
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.deleteResource("Evidence", mountedEntity.objectId, (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else console.log(result);
                    });
                });
            break;

            /**  End Message Service for Evidence */


            /**  Start Message Service for Device */

            case "add_device":
            deviceService.mountDevice(message.sReadSSI, (err, mountedDevice) => {
                if (err){
                    console.log(err);
                }
                console.log("**************** Data from Clinical Site SSAPP  ******************");
                console.log(mountedDevice);
                const domainConfig = {
                    "type": "IotAdaptor",
                    "option": {
                        "endpoint": "http://127.0.0.1:3000/adaptor"
                    }
                };
                var deviceData = {
                    "resourceType": mountedDevice.resourceType,
                    "identifier": mountedDevice.identifier,
                    "status": mountedDevice.status,
                    "manufacturer": mountedDevice.manufacturer,
                    "deviceName": mountedDevice.device,
                    "modelNumber": mountedDevice.modelNumber,
                    "serialNumber": mountedDevice.deviceId
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
            break;

            case "list_device":
                {
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.searchResources("Device", (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else console.log(result);
                    });
                }
            break;

            case "update_device":
            console.log(message);
            deviceService.mountDevice(message.sReadSSI, (err, mountedDevice) => {
                if (err){
                    console.log(err);
                }
                const entityId = mountedDevice.objectId;
                console.log(mountedDevice);
                const domainConfig = {
                    "type": "IotAdaptor",
                    "option": {
                        "endpoint": "http://127.0.0.1:3000/adaptor"
                    }
                };
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
            break;

            case "get_a_device":
                deviceService.mount(message.ssi, (err, mountedEntity) => {
                    if (err){
                        console.log(err);
                    }
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
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
            break;

            case "delete_device":
                deviceService.mount(message.ssi, (err, mountedEntity) => {
                    if (err){
                        console.log(err);
                    }
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.deleteResource("Device", mountedEntity.objectId, (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else console.log(result);
                    });
                });
            break;


            /**  End Message Service for Device */


            /**  Start Message Service for Device Assignment to Patient */


            case "assign_device_to_patient":
                deviceService.mount(message.ssi, (err, mountedEntity) => { //Assignation Serice
                    if (err){
                        console.log(err);
                    }
                    const domainConfig = {
                        "type": "IotAdaptor",
                        "option": {
                            "endpoint": "http://localhost:3000/iotAdapter"
                        }
                    }
                    let flow = $$.flow.start(domainConfig.type);
                    flow.init(domainConfig);
                    flow.assignDevice(mountedEntity, (error, result)=>{
                        if (error) {
                            console.log(error);
                        }
                        else 
                        {
                            console.log(result.healthDataDsu);
                            console.log(result.deviceRequest);
                            await communicationService.sendMessage(mountedEntity.patientDID, result);
                        }
                    });
                });
            break;

        default:
            console.log("*******************************");
            console.log(`Received message from ${message.senderIdentity}`);
            console.log("*******************************");
            await communicationService.sendMessage(message.senderIdentity, message);
    }


}

module.exports = messageHandlerStrategy;