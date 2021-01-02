const crypto = require('crypto');
const {Storage} = require('@google-cloud/storage');

// Setup Storage
// https://googleapis.dev/nodejs/storage/latest/
const bucketName = 'ornithodata';
const reportFileName = 'index.handlebars'
const storage = new Storage(); // new Storage({keyFilename: "key.json"});
const myBucket = storage.bucket(bucketName);

const emptyDataFileObject = () => {
  return {
    "md5": "78d3b2ae9b204514921f00da685ad193",
    "runTimestamp": 1609605194925,
    "reportDate": "1.1.2000",
    "url": "http://localhost:8080",
    "hits": []
  };
}

/**
 * Create empty data file in Google Cloud Storage, if not exists
 *
 * @param storageFile
 * @return {Promise<void>}
 */
const createIfNotExists = async storageFile => {
  const exists = await storageFile.exists();
  console.log('File Exists:', reportFileName, exists);
  if (!exists[0]) {
    // Create empty data file
    try {
      return storageFile.save(JSON.stringify(emptyDataFileObject()));
    } catch (error) {
      console.error('Error creating empty start file', error);
    }
  }
};


/**
 * Read and de-serialize JSON object from blob file.
 *
 * @param file
 * @return {Promise<any>}
 */
const readJSONFile = async fileName => {
  const file = myBucket.file(fileName);
  const data = await file.download(); // https://googleapis.dev/nodejs/storage/latest/File.html#download
  return JSON.parse(data[0].toString('utf8'));
}


/**
 * Serialize JSON to string and store in blob file.
 *
 * @See https://googleapis.dev/nodejs/storage/latest/File.html#save
 *
 * @param report
 * @param file
 * @return {Promise<void>}
 */
const storeObject = async (object, fileName) => {
  console.log('Saving new report');
  const file = myBucket.file(fileName);
  const metadata = {
    contentType: 'application/json',
    metadata: {}
  };
  await file.setMetadata(metadata);
  return file.save(JSON.stringify(object));
}

/**
 * Store HTML in blob.
 *
 * @param htmlString
 * @param fileName
 * @return {Promise<void>}
 */
const storeHTML = async (htmlString, fileName) => {
  console.log('Saving new HTML report', fileName);
  const file = myBucket.file(fileName);
  const metadata = {
    contentType: 'text/html',
    metadata: {}
  };
  await file.setMetadata(metadata);
  return file.save(htmlString);
}

module.exports = {
  createIfNotExists,
  readJSONFile,
  storeObject,
  storeHTML
}
