const etlService = require("../utils/etlService");
const dsuService = require("../utils/dsuService");
const FhirStorage = require("../storages/fhir.js")
const DbStorage = require("../storages/db.js")
const DsuStorage = require("../storages/dsu.js")


$$.flow.describe('IotAdaptor', {

    init: function (domainConfig) {
        const endpointURL = new URL(domainConfig.option.endpoint);
        this.commandData = {};
        this.commandData.apiEndpoint = endpointURL.hostname;
        this.commandData.apiPort = endpointURL.port;
        this.commandData.protocol = endpointURL.protocol.replace(':', "");
        // this.fhir = new FhirStorage({
        //   baseUrl: 'http://localhost:8090/fhir'
        // });

        this.mainDb = new DbStorage({
          baseURL: process.env.STORAGE_API_BASE_URL,
          headers: {
            'X-Storage-Application-Id': process.env.STORAGE_API_APP_ID,
            'X-Storage-REST-API-Key': process.env.STORAGE_API_REST_API_KEY,
            'Content-Type': 'application/json'
          }
        });
    },
    processXml: function (xmlString, callback) {
        etlService.processXml(this.mainDb, xmlString, callback);
    },
    searchResources: async function (resourceType, params, callback) {
        let resource = await this.mainDb.searchResourcesAsync(resourceType, params);
        if(resource){
          callback(undefined, resource);
        }
    },
    createResource: function (resourceType, jsonData, callback) {
        this.mainDb.createResource(resourceType,  jsonData, callback);
    },
    updateResource: function (resourceType, id, jsonData, callback) {
        //this.fhir.updateResource(resourceType, id, jsonData, callback);
        this.mainDb.updateResource(resourceType, id, jsonData, callback);
    },
    getResourceById: function (resourceType, id, callback) {
        //this.fhir.getResourceById(resourceType, id, callback);
        this.mainDb.getResourceById(resourceType, id, callback);
    },
    getResourceBySk: function (resourceType, id, callback) {
      this.mainDb.getResourceBySk(resourceType, id, callback);
  },
    getObservationByPatientId: function (resourceType, id, callback) {
      //this.fhir.getResourceById(resourceType, id, callback);
        this.mainDb.getObservationByPatientId(resourceType, id, callback);
    },
    getAllObservations: function (resourceType, id, callback) {
        this.mainDb.getAllObservations(resourceType, "Patient/6VHBJrEp4s", callback);
    },
    deleteResource: function(resourceType, id, callback) {
        //this.fhir.deleteResource(resourceType, id, callback);
        this.mainDb.deleteResource(resourceType, id, callback);
    },
    createDSU: function (callback) {
        dsuService.createWalletDB('sharedDB')
          .then((response) => {
              callback(undefined, response);
          })
          .catch((error) => {
              callback(error, undefined);
          });
    },
    createDsuResource: function (keySSI, dbName, resourceType, jsonData, callback) {
        const dsu = new DsuStorage({
          keySSI: keySSI,
          dbName: dbName
        });
        dsu.createResource(resourceType, jsonData, callback);
    },
    searchDsuResources: function (keySSI, dbName, resourceType, params, callback) {
        const dsu = new DsuStorage({
          keySSI: keySSI,
          dbName: dbName
        });
        dsu.searchResources(resourceType, params, callback);
    },
    updateDsuResource: function (keySSI, dbName, resourceType, id, jsonData, callback) {
        const dsu = new DsuStorage({
          keySSI: keySSI,
          dbName: dbName
        });
        dsu.updateResource(resourceType, id, jsonData, callback);
    },
    getDsuResourceById: function (keySSI, dbName, resourceType, id, callback) {
        const dsu = new DsuStorage({
          keySSI: keySSI,
          dbName: dbName
        });
        dsu.getResourceById(resourceType, id, callback);
    },
    deleteDsuResource: function(keySSI, dbName, resourceType, id, callback) {
        const dsu = new DsuStorage({
          keySSI: keySSI,
          dbName: dbName
        });
        dsu.deleteResource(resourceType, id, callback);
    },
    assignDevice: async function (jsonData, callback) {
      console.log("************* Assign Device ***********")
      console.log(jsonData)
      const patientId = jsonData.patientDID;
      const trialParticipantNumber = jsonData.trialParticipantNumber;
      const deviceId = jsonData.deviceId;
      try {
        const patients = await this.mainDb.searchResourcesAsync('Patient', { where: { "sk": trialParticipantNumber } });
        // console.log("************* Patients ***********")
        // console.log(patients)
        const devices = await this.mainDb.searchResourcesAsync('Device', { where: { "identifier.value": deviceId } });
        console.log("************* Patient ***********")
        // console.log(devices)
        const patient = patients[0];
        const device = devices[0];
        console.log(patient);
        const newDeviceRequest = {
          status: 'active',
          intent: 'original-order',
          codeReference: {
            reference: `Device/${device.id}`
          },
          subject: {
            reference: `Patient/${patient.sk}`
          },
          trialUid : device.trialUid,
          trialParticipantNumber : trialParticipantNumber
        }
        device.isAssigned  = true;

        let deviceRequest, healthDataDsu, observations;
        const dsuDbName = 'sharedDB';
        try {
          this.mainDb.updateResource("Device", device.id, device, (error, result)=>{
            console.log("********** Update Resource *********")
            if(error){
              console.log(error)
            }
            console.log(result);
          });
          
        } catch (error) {
         console.log(error); 
        }
        // original script for multi-patient
        deviceRequest = await this.mainDb.findResourceAsync('DeviceRequest', { where: { "status": "active", "codeReference.reference": `Device/${device.id}`, "subject.reference": `Patient/${patient.id}` } });
        
       
        // Demo Script for testing
        // deviceRequest = await this.mainDb.findResourceAsync('DeviceRequest', { where: { "status": "active", "codeReference.reference": `Device/${device.id}`, "subject.reference": `Patient/${patient.id}` } });

        if(!deviceRequest) {
          deviceRequest = await this.mainDb.createResourceAsync('DeviceRequest', newDeviceRequest);
          dsu = await dsuService.createWalletDB(dsuDbName);
          const newHeathDataDsu = {
            codeReference: {
              reference: `DeviceRequest/${deviceRequest.id}`
            },
            seedSSI: dsu.seedSSI,
            sReadSSI: dsu.sReadSSI,
            dbName: dsuDbName
          }
          healthDataDsu = await this.mainDb.createResourceAsync('HealthDataDsu', newHeathDataDsu);
        } else {
          healthDataDsu = await this.mainDb.findResourceAsync('HealthDataDsu', { where: { "codeReference.reference": `DeviceRequest/${deviceRequest.id}` } });
        }
        
        callback(undefined, {
          deviceRequest: deviceRequest,
          healthDataDsu: healthDataDsu
        });
      } catch (error) {
        console.error(error);
        callback(error, undefined);
      }
    },
    createEvidenceDsu: async function (jsonData, callback) {
      const resources = await this.mainDb.searchResourcesAsync('EvidenceDataDsu', { where: {  } });
      let evidenceDataDsu = resources[0];
      // console.log("Flow of the eveidence DSU");
      if(!evidenceDataDsu){
        const dsuDbName = "clinicalDecisionSupport";
        const dsu = await dsuService.createWalletDB(dsuDbName);
        const newEvidenceDataDsu = {
          // codeReference: {
          //   reference: `Practitioner/${deviceRequest.id}`
          // },
          seedSSI: dsu.seedSSI,
          sReadSSI: dsu.sReadSSI,
          dbName: dsuDbName
        }

        evidenceDataDsu = await this.mainDb.createResourceAsync('EvidenceDataDsu', newEvidenceDataDsu);
      }

      callback(undefined, evidenceDataDsu);

    }


});
