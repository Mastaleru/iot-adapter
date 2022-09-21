const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient) {
  let CSV_FOLDER = "1PSgC9RWj0A7osNqMIUdyLTSx825IAGNX"
  const drive = google.drive({version: 'v3', auth: authClient});
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    q: `'${CSV_FOLDER}' in parents`
  });
  const files = res.data.files;
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  console.log('Files:');
  files.map((file) => {
    console.log(`${file.name} (${file.id})`);
  });
  //await downloadFile(files[0].id,files[0].name, authClient);
}

async function downloadFile(realFileId, name, auth) {

  const drive = google.drive({version: 'v2', auth});

  fileId = realFileId;
  try {
    const file = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    var bufferString = file.data;
    var arr = bufferString.split('\n'); 
    var userObj=JSON.parse(JSON.stringify(bufferString));//data to add
    fs.appendFile(name, userObj, (err) => {
        if (err) console.error('Couldn\'t append the data');
        console.log('The data was appended to '+name+' file!');
    });
    // console.log(arr);
    var jsonObj = [];
    var headers = arr[0].split(',');
    var test = [];
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
    for(var i = 1; i < arr.length-1; i++) {
      var data = arr[i].split(',');
      var obj = {};
      for(var j = 0; j < data.length; j++) {
        let some = data[j].replace(/"/g, '');
        obj[headers[j]] = some;
      }
      jsonObj.push(obj);
    }
    return jsonObj;
  } catch (err) {
    throw err;
  }
}

authorize().then(listFiles).catch(console.error);