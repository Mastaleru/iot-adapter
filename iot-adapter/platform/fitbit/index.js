const { google } = require("googleapis");
const docs = require('@googleapis/docs')
const fitbit = require("./fitbitEtlService");
const fs = require("fs");
const hl7HealthDataMapper = {
    "pulseoximeter": [fitbit.createSpO2Resource,fitbit.createPulseResource],
    "bpm": [fitbit.createSysResource,fitbit.createDiaResource],
    "thermo": [fitbit.createBodyTempResource],
    "activity": [fitbit.createCaloriesBurnedResource]
}

const scopes = ["https://www.googleapis.com/auth/drive"];

const auth = new docs.auth.GoogleAuth({
    keyFilename: './platform/fitbit/credentials-service.json',
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: scopes[0]
});
const drive = google.drive({ version: "v3", auth });

// This is a simple sample script for retrieving the file list.
let CSV_FOLDER = "1PSgC9RWj0A7osNqMIUdyLTSx825IAGNX"
drive.files.list(
    {
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
        q: `'${CSV_FOLDER}' in parents`
    },
    (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const files = res.data.files;
        console.log(files);
        files.forEach((folder)=>{
            getPatientData(folder)
        })
    }
);

function getPatientData(patientFolder){


        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
            q: `'${patientFolder.id}' in parents and mimeType=\'text/csv\'`
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            console.log(res.data);

            if (files.length) {
                files.forEach(async (file) => {
                    console.log(`${file.name} (${file.id})`);


                    const deviceTypeDataExtractors = file.name.substring(0,file.name.indexOf("."));

                    if (!hl7HealthDataMapper[deviceTypeDataExtractors]) {
                        return console.error(`${deviceTypeDataExtractors} not recognized`);
                    }

                    let name = patientFolder.name + '_' + file.name;
                    const data = await downloadFile(file.id, name, auth);

                    hl7HealthDataMapper[deviceTypeDataExtractors].forEach(dataExtractor=>{
                        for (let i = 0; i < data.length; i++) {
                            dataExtractor(patientFolder.name, data[i]);
                        }
                    })
                });
            } else {
                console.log('No files found in fitbit.');
            }
        });

}

async function downloadFile(realFileId, name, auth) {

    const drive = google.drive({version: 'v3', auth});

    try {
        const file = await drive.files.get({
            fileId: realFileId,
            alt: 'media',
        });
        let bufferString = file.data;
        let arr = bufferString.split('\n');
        let userObj=JSON.parse(JSON.stringify(bufferString));//data to add
        fs.appendFile(name, userObj, (err) => {
            if (err) console.error('Couldn\'t append the data');
            console.log('The data was appended to '+name+' file!');
        });
        // console.log(arr);
        let jsonObj = [];
        let headers = arr[0].split(',');
        let test = [];
        for(let i = 0; i <headers.length; i++){
            let some = headers[i].replace(/"/g, '');
            some = some.replace(/ /g, '_');
            some = some.replace(/\(/g, '');
            some = some.replace(/\)/g, '');
            some = some.replace(/\//g, '_');
            some = some.replace(/-/g, '_');
            some = some.replace(/\./g, '_');
            some = some.replace(/:/g, '_');
            test.push(some)
        }

        headers = test;
        for(let i = 1; i < arr.length-1; i++) {
            let data = arr[i].split(',');
            let obj = {};
            for(var j = 0; j < data.length; j++) {
                obj[headers[j]] = data[j].replace(/"/g, '');
            }
            jsonObj.push(obj);
        }
        return jsonObj;
    } catch (err) {
        throw err;
    }
}