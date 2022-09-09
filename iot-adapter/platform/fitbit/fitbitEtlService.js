const moment = require('moment');


const buildSpO2Resource = (patientId, data) => {
    // console.log(data.Date_US)
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
    const identifier = `patient/${patientId}/observation/spo2/${effectiveDateTime.unix()}`;
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
        value:data.SpO2,
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%"
      }
    };
    return resource;
  }
  const buildBodyTempResource = (patientId, data) => {
    // console.log(data.Date_US)
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
    const identifier = `patient/${patientId}/observation/bodytemp/${effectiveDateTime.unix()}`;
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
          code: "8310-5"
        }],
        text: "Body temperature"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: effectiveDateTime.toISOString(),
      valueQuantity: {
        value:data.Temperature_C,
        unit: "Cel",
        system: "http://unitsofmeasure.org",
        code: "Cel"
      }
    };
    return resource;
  }
  const buildPulseResource = (patientId, data) => {
    // console.log(data.Date_US)
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
    const identifier = `patient/${patientId}/observation/pulse/${effectiveDateTime.unix()}`;
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
          code: "8889-8"
        }],
        text: "Heart rate"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: effectiveDateTime.toISOString(),
      valueQuantity: {
        value:data.Pulse,
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%"
      }
    };
    return resource;
  }
  
  
  const buildSystolicBloodPressureResource = (patientId, data) => {
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
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
        value: data.Systolic,
        unit: "mmHg",
        system: "http://unitsofmeasure.org",
        code: "mmHg"
      }
    };
    return resource;
  }
  
  const buildDiasystolicBloodPressureResource = (patientId, data) => {
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
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
        value: data.Diastolic,
        unit: "mmHg",
        system: "http://unitsofmeasure.org",
        code: "mmHg"
      }
    };
    return resource;
  }
  const buildCaloriesBurnedResource = (patientId, data) => {
    const effectiveDateTime = moment(data.Date_non_US, 'YYYY-MM-DD HH:mm:ss');
    const identifier = `patient/${patientId}/observation/calburned/${effectiveDateTime.unix()}`;
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
            code: "41981-2"
          }
        ],
        text: "Calories burned"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: effectiveDateTime.toISOString(),
      valueQuantity: {
        value: data.Calories_Burned,
        unit: "kcal",
        system: "http://unitsofmeasure.org",
        code: "kcal"
      }
    };
    return resource;
  }
  const buildPatientResource = (patientID) => {
    const resource = {
      sk: patientId,
      name: [{ use: 'official', family: "XXXXXXX", given: "XXXXXXX" }],
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
          value: patientId
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
          value: patientId
        },
      ]
    };
    return resource;
  }

const buildDeviceResource = (deviceInfo) => {
  const resource = {
    sk: deviceInfo.deviceId,
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
        value: deviceInfo.deviceId
      }
    ],
    serialNumber: deviceInfo.serialNumber,
    status: "Active",
    modelNumber: deviceInfo.modelNumber,
    manufacturer: "Fitbit",
    deviceName: [
      {
        "name": deviceInfo.name,
        "type": "manufacturer-name"
      }
    ]
  };
  return resource;
}

  module.exports = {
    createSysResource: buildSystolicBloodPressureResource,
    createDiaResource: buildDiasystolicBloodPressureResource,
    createSpO2Resource: buildSpO2Resource,
    createPulseResource: buildPulseResource,
    createBodyTempResource: buildBodyTempResource,
    createCaloriesBurnedResource: buildCaloriesBurnedResource,
    createPatientResource: buildPatientResource,
    createDeviceResource: buildDeviceResource
  }

