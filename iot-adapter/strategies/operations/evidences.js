const commonServices = require("common-services")
const {EvidenceService} = commonServices;
const evidenceService = new EvidenceService();

const domainConfig = {
    "type": "IotAdaptor",
    "option": {
        "endpoint": "http://localhost:3000/iotAdapter"
    }
}

function new_evidence(message){
    evidenceService.mount(message.ssi, (err, mountedEntity) => {
        if (err){
            console.log(err);
        }
        console.log("**************** Data from Researcher SSAPP  ******************");
        console.log(mountedEntity);
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
}

function list_evidences(message){
    {
        let flow = $$.flow.start(domainConfig.type);
        flow.init(domainConfig);
        flow.searchResources("Evidence", (error, result)=>{
            if (error) {
                console.log(error);
            }
            else console.log(result);
        });
    }
}

module.exports = {
    "new-evidence": new_evidence,
    "list_evidences":list_evidences
}