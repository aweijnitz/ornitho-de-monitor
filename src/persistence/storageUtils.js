const crypto = require('crypto');

/****** NOTE!
 * Currently not in use, since Could Functions for some reason do not install the storage npm package.
 *
 * Leaving this file here for better days. See index.js for the database backed storage.
 *
 *
 * This was the old initialization code
 *
 * // Setup Storage
 // https://googleapis.dev/nodejs/storage/latest/
 const bucketName = 'ornithodata';
 const bookKeepingFileName = 'ornitho-de-data.json'
 const storage = new Storage(); // new Storage({keyFilename: "key.json"});
 const myBucket = storage.bucket(bucketName);
 *
 */


/**
 * Helper to create the scaffold of the storage object.
 *
 * @return {{reports: [], created: number, latestHash: string}}
 */
const emptyDataFileObject = () => {
  return {
    created: Date.now(),
    latestHash: crypto.createHash('md5').update('no-data').digest("hex"),
    reports: []
  }
}

/**
 * Create empty data file in Google Cloud Storage, if not exists
 *
 * @param storageFile
 * @return {Promise<void>}
 */
const createIfNotExists = async storageFile => {
  const exists = await storageFile.exists();
  console.log('Exists:', exists);
  if (!exists[0]) {
    // Create empty data file
    try {
      await storageFile.save(JSON.stringify(emptyDataFileObject()));
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
const readJSONFile = async file => {
  const data = await file.download(); // https://googleapis.dev/nodejs/storage/latest/File.html#download
  return JSON.parse(data[0].toString('utf8'));
}


/**
 * Add new report to archive and serialize to blob file.
 *
 * @See https://googleapis.dev/nodejs/storage/latest/File.html#save
 *
 * @param report
 * @param file
 * @return {Promise<void>}
 */
const storeData = async (contents, file) => {
  console.log('Saving new report');
  return file.save(JSON.stringify(contents));
}



module.exports = {
  createIfNotExists,
  readJSONFile,
  storeData
}