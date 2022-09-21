const { google } = require("googleapis");
const docs = require('@googleapis/docs')

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
    }
);