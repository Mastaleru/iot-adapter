const _ = require('lodash');
const parseXml = require('xml2js').parseString;
// const FhirStorage = require("../storages/fhir.js");
const DbStorage = require("../storages/db.js");
const DsuStorage = require("../storages/dsu.js");
const moment = require('moment');

const escapeXml = (unsafe) => {
  return unsafe.replace(/[&]/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
    }
  });
}

const buildPatientResource = (xmlDocument, ID) => {
  const patientInfo = xmlDocument.dantest.patient_info[0];
  const resource = {
    sk: patientInfo.patientcode[0],
    // sk: ID,
    name: [{ use: 'official', family: patientInfo.lname[0], given: [patientInfo.fname[0]] }],
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR"
            }
          ]
        },
        value: patientInfo.patientcode[0]
        // value: ID
      },
      {
        use: 'official',
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "RI"
            }
          ]
        },
        value: patientInfo.usercode[0]
      },
    ]
  };
  return resource;
}

const buildDeviceResource = (xmlDocument) => {
  const measurement_info = xmlDocument.dantest.measurement_info[0];
  const resource = {
    sk: measurement_info.hw_sn[0],
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "SNO"
            }
          ]
        },
        value: measurement_info.hw_sn[0]
      }
    ],
    serialNumber: measurement_info.hw_sn[0]
  };
  return resource;
}

const buildHeightResource = (patientId, xmlDocument) => {
  const patientInfo = xmlDocument.dantest.patient_info[0];
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const identifier = `patient/${patientId}/observation/height/${effectiveDateTime.unix()}`;
  var height = Math.random() * 155.0 + 185.0;
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "8302-2"
      }],
      text: "Height"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      // value: patientInfo.height[0],
      value: height.toFixed(2),
      unit: "cm",
      system: "http://unitsofmeasure.org",
      code: "cm"
    }
  };
  return resource;
}

const buildWeightResource = (patientId, xmlDocument) => {
  const patientInfo = xmlDocument.dantest.patient_info[0];
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const identifier = `patient/${patientId}/observation/weight/${effectiveDateTime.unix()}`;
  // var weight = Math.random() * 40.0 + 50.0;
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "29463-7"
      }],
      text: "Weight"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      value: patientInfo.weight[0],
      // value: weight.toFixed(2),
      unit: "kg",
      system: "http://unitsofmeasure.org",
      code: "kg"
    }
  };
  return resource;
}

const buildAgeResource = (patientId, xmlDocument) => {
  const patientInfo = xmlDocument.dantest.patient_info[0];
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const identifier = `patient/${patientId}/observation/age/${effectiveDateTime.unix()}`;
  // var age = Math.floor(Math.random() * 65 + 25);
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "30525-0"
      }],
      text: "Age"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      value: patientInfo.age[0],
      // value: age,
      unit: "a",
      system: "http://unitsofmeasure.org",
      code: "a"
    }
  };
  return resource;
}

const buildSystolicBloodPressureResource = (patientId, xmlDocument) => {
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const results = xmlDocument.dantest.results[0];
  const pwv = results.pwv[0];
  // var sys = Math.random() * 15.0 + 115.0;
  const bpSys = _.find(pwv.item, function (object) { return object.$.code === 'PTG-BPSYS'; });
  const identifier = `patient/${patientId}/observation/bpsys/${effectiveDateTime.unix()}`;
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "8480-6"
      }
      ],
      text: "Systolic Blood Pressure"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      value: bpSys._,
      // value: sys.toFixed(2),
      unit: "mmHg",
      system: "http://unitsofmeasure.org",
      code: "mmHg"
    }
  };
  return resource;
}

const buildDiasystolicBloodPressureResource = (patientId, xmlDocument) => {
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const results = xmlDocument.dantest.results[0];
  const pwv = results.pwv[0];
  // var dia = Math.random() * 20.0 + 60.0;
  const bpDia = _.find(pwv.item, function (object) { return object.$.code === 'PTG-BPDIA'; });
  const identifier = `patient/${patientId}/observation/bpdia/${effectiveDateTime.unix()}`;
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8462-4"
        }
      ],
      text: "Diastolic Blood Pressure"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      value: bpDia._,
      // value: dia.toFixed(2),
      unit: "mmHg",
      system: "http://unitsofmeasure.org",
      code: "mmHg"
    }
  };
  return resource;
}

const buildSpO2Resource = (patientId, xmlDocument) => {
  const measurementInfo = xmlDocument.dantest.measurement_info[0];
  const effectiveDateTime = moment(measurementInfo.date[0], 'YYYY-MM-DD HH:mm:ss');
  const results = xmlDocument.dantest.results[0];
  const pwv = results.pwv[0];

  const spO2 = _.find(pwv.item, function (object) { return object.$.code === 'PTG-SpO2'; });
  const identifier = `patient/${patientId}/observation/spo2/${effectiveDateTime.unix()}`;
  // var spo2 = Math.random() * 5.0 + 95.0;
  const resource = {
    sk: patientId,
    identifier: [
      {
        use: 'secondary',
        value: identifier
      }
    ],
    code: {
      coding: [{
        system: "http://loinc.org",
        code: "20564-1"
      }],
      text: "SpO2"
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: effectiveDateTime.toISOString(),
    valueQuantity: {
      value: spO2._,
      // for demo purpose
      // value: spo2.toFixed(2),
      unit: "%",
      system: "http://unitsofmeasure.org",
      code: "%"
    }
  };
  return resource;
}

const sendObservationsToDsu = async (observations, healthDataDsu) => {
  const storage = new DsuStorage({
    keySSI: healthDataDsu.sReadSSI,
    dbName: healthDataDsu.dbName
  });

  _.forEach(observations, function(observation) {
    const _resource = _.omit(observation, [
      'id'
    ]);
    const sk = _resource.identifier[0].value;
    storage.findOrCreateResource('Observation', _resource, { query: `sk == '${sk}'` }, (error, resource) => {
      //console.log(error);
      //console.log(resource);
    });
  });
}
const processXml = (mainDb, xmlString, callback) => {
  parseXml(escapeXml(xmlString), async function (error, result) {
    if (error) {
      callback(error, null);
    } else {
      // for debug purpose Start 
      // var ID = "";
      // for(let i=1; i<=5; i++){
      //   for(let j=1; j<=5; j++){
      //     for(let k=10001; k<=10010; k++){
      //     ID="MT"+i+"-CS"+j+"-"+k;
          // for debug purpose End 
      const patient_info = result.dantest.patient_info[0];
      const measurement_info = result.dantest.measurement_info[0];
      const results = result.dantest.results[0];

      const pwv = results.pwv[0];
      const effectiveDateTime = moment(measurement_info.date[0], 'YYYY-MM-DD HH:mm:ss');
      const newPatient = buildPatientResource(result);
      const newDevice = buildDeviceResource(result);

      const patientIdentifier = newPatient.identifier[0].value;
      const deviceSN = newDevice.identifier[0].value;

      try {
        const observations = [];
        const device = await mainDb.findOrCreateResourceAsync('Device', newDevice, { where: { "identifier.value": deviceSN } });
        const patient = await mainDb.findOrCreateResourceAsync('Patient', newPatient, { where: { "identifier.value": patientIdentifier } });

        // console.log(patient)
        // console.log(device)
        //Start Height
        const bodyHeight = buildHeightResource(patient.sk, result);
        const heightIdentifier = bodyHeight.identifier[0].value;
        const bodyHeightObservation = await mainDb.findOrCreateResourceAsync('Observation', bodyHeight, { where: { "identifier.value": heightIdentifier } });
        observations.push(bodyHeightObservation);
        //End Height

        //Start Weight
        const bodyWeight = buildWeightResource(patient.sk, result);
        const weightIdentifier = bodyWeight.identifier[0].value;
        const bodyWeightObservation = await mainDb.findOrCreateResourceAsync('Observation', bodyWeight, { where: { "identifier.value": weightIdentifier } });
        observations.push(bodyWeightObservation);
        //End Weight

        //Start Age
        const age = buildAgeResource(patient.sk, result);
        const ageIdentifier = age.identifier[0].value;
        const ageObservation = await mainDb.findOrCreateResourceAsync('Observation', age, { where: { "identifier.value": ageIdentifier } });
        observations.push(ageObservation);
        //End Age

        //Start Systolic Blood Pressure  
        const bpSys = buildSystolicBloodPressureResource(patient.sk, result);
        const bpSysIdentifier = bpSys.identifier[0].value;
        const bpSysObservation = await mainDb.findOrCreateResourceAsync('Observation', bpSys, { where: { "identifier.value": bpSysIdentifier } });
        observations.push(bpSysObservation);
        //End Blood Pressure

        //Start Diasystolic Blood Pressure
        const bpDia = buildDiasystolicBloodPressureResource(patient.sk, result);
        const bpDiaIdentifier = bpDia.identifier[0].value;
        const bpDiaObservation = await mainDb.findOrCreateResourceAsync('Observation', bpDia, { where: { "identifier.value": bpDiaIdentifier } });
        observations.push(bpDiaObservation);
        //End Diasystolic Blood Pressure

        //Start SpO2
        const spO2 = buildSpO2Resource(patient.sk, result);
        const spO2Identifier = spO2.identifier[0].value;
        const spO2Observation = await mainDb.findOrCreateResourceAsync('Observation', spO2, { where: { "identifier.value": spO2Identifier } });
        observations.push(spO2Observation);
        //End SpO2

        const deviceRequest = await mainDb.findResourceAsync('DeviceRequest', { where: { "status": "active", "codeReference.reference": `Device/${device.id}`, "subject.reference": `Patient/${patient.id}` } });
        if(deviceRequest) {
          const healthDataDsu = await mainDb.findResourceAsync('HealthDataDsu', { where: { "codeReference.reference": `DeviceRequest/${deviceRequest.id}` } });
          sendObservationsToDsu(observations, healthDataDsu);
        }

      } catch (error) {
        // console.log(error);
      }
      // for debug purpose Start 
//     }
//   }
// }
// for debug purpose End 

      callback(undefined, { success: true });
    }
  });
};

module.exports = {
  processXml: processXml
}
