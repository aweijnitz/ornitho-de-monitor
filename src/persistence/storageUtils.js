const crypto = require('crypto');
const {Storage} = require('@google-cloud/storage');

// Setup Storage
// https://googleapis.dev/nodejs/storage/latest/
const bucketName = 'ornithodata';
const reportFileName = 'index.handlebars'
const storage = new Storage(); // new Storage({keyFilename: "key.json"});
const myBucket = storage.bucket(bucketName);


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
 * @param object
 * @param fileName
 * @return publicUrl or null
 */
const storeObject = async (object, fileName) => {
  console.log('Saving new report');
  try {
    const file = myBucket.file(fileName);
    const metadata = {
      contentType: 'application/json',
      metadata: {}
    };
    await file.setMetadata(metadata);
    await file.save(JSON.stringify(object));
    await file.makePublic();
    return file.publicUrl();
  } catch (err) {
    console.log("SAVING ERROR", fileName, err.message);
  }
  return null;
}

/**
 * Store HTML in blob.
 *
 * @param htmlString
 * @param fileName
 * @return publicUrl, or null
 */
const storeHTML = async (htmlString, fileName) => {
  console.log('Saving new HTML report', fileName);
  try {
    const file = myBucket.file(fileName);
    const metadata = {
      contentType: 'text/html',
      metadata: {}
    };
    await file.setMetadata(metadata);
    await file.save(htmlString);
    await file.makePublic();
    return file.publicUrl();
  } catch(err) {
    console.log("SAVING ERROR", fileName, err.message);
  }
  return null;
}

module.exports = {
  readJSONFile,
  storeObject,
  storeHTML
}
