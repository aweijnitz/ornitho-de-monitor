const {Storage} = require('@google-cloud/storage');
const {
  publishNotificationMessage,
  isObservationMessage
} = require('./utils/publishMessage');
const {
  createIfNotExists,
  readJSONFile,
  storeData
} = require('./utils/storageUtils');

const {isSameDay} = require('./utils/reportUtils');

// Setup Storage
// https://googleapis.dev/nodejs/storage/latest/
const bucketName = 'ornithodata';
const bookKeepingFileName = 'ornitho-de-data.json'
const storage = new Storage(); // new Storage({keyFilename: "key.json"});
const myBucket = storage.bucket(bucketName);


const addAndTruncate = (newItem, dataStoreReports, maxLength = 16) => {
  const length = dataStoreReports.unshift(newItem);
  return length > maxLength ? dataStoreReports.slice(0, maxLength) : dataStoreReports;
}

/**
 * Check report, do book-keeping and trigger notification if needed.
 *
 * @param newReport
 * @return {Promise<void>}
 */
const analyzeMsg = async newReport => {
  console.log('Analyzing', JSON.stringify(newReport));
  console.log('hits', newReport.hits);
  const dataFile = myBucket.file(bookKeepingFileName);
  await createIfNotExists(dataFile);
  const dataFromStorage = await readJSONFile(dataFile);
  console.log('dataFromStorage', JSON.stringify(dataFromStorage));
  
  if ((dataFromStorage.latestHash !== newReport.md5)
    && isSameDay(newReport, dataFromStorage)) {
    // Ok, so we now know we have a report which is different from last time.
    // If the day rolled over, the report will be different, but we don't want to be notified about it,
    // but we got here, so the report changed and it is worth while notifying about it.
    publishNotificationMessage(newReport);
    dataFromStorage.latestHash = newReport.md5;
    dataFromStorage.reports = addAndTruncate(newReport, dataFromStorage.reports);
    return storeData(dataFromStorage, dataFile);
  }
}

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is executed when the trigger topic receives a message.
 *
 * @See https://cloud.google.com/functions/docs/writing/background#cloud_pubsub_example
 *
 * @param {object} message The Pub/Sub message.
 * @param {object} context The event metadata.
 */
exports.analyzeObservations = async (message, context) => {
  console.log('ANALYZER TRIGGERED!', JSON.stringify(message), JSON.stringify(context));
  if (!isObservationMessage(message)) {
    console.log('Analyzer skipping message.', msgType);
    return;
  }
  const payload = message.data
    ? Buffer.from(message.data, 'base64').toString()
    : false;
  
  if (payload !== false)
    return await analyzeMsg(JSON.parse(payload));
};
