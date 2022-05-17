//Load openDSU SDK
const opendsu = require("opendsu");
//Load resolver library
const resolver = opendsu.loadApi("resolver");
//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const db = opendsu.loadApi("db");

const getSharedDB = (sReadSSI, dbName) => {
  const sReadSSIObject = keyssispace.parse(sReadSSI);
  const dbObject = db.getSharedDB(sReadSSIObject, dbName);
  return dbObject;
}

const createWalletDB = (dbName) => {
  return new Promise(function(resolve, reject) {
    // console.log("Create Wallet DB DSU Service");
    keyssispace.createSeedSSI('default', (error, seedSSIObject) => {
      if(error) {
        reject(error);
      } else {
        // console.log('**********************');
        const sReadSSIObject = seedSSIObject.derive();
        const dbObject = db.getWalletDB(seedSSIObject, dbName);
        // console.log(dbObject);
        // console.log(sReadSSIObject);

        resolve({
          seedSSI: seedSSIObject.getIdentifier(),
          sReadSSI: sReadSSIObject.getIdentifier()
        });
      }
    });
  });
};

//Resource

const searchResource = (type, params, callback) => {
};

const createResource = (type, jsonData, callback) => {
};

const updateResource = (type, id, jsonData, callback) => {
};

const getResourceById = (type, id, callback) => {
};

const deleteResource = (type, id, callback) => {
};

const findOrCreateResource = (type, jsonData, params, callback) => {
};



module.exports = {
    resource: {
      search: searchResource,
      getById: getResourceById,
      create: createResource,
      update: updateResource,
      findOrCreate: findOrCreateResource,
      delete: deleteResource
    },
    createWalletDB: createWalletDB
}
