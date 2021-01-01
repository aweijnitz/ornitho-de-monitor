const {
  publishNotificationMessage,
  isObservationMessage
} = require('./utils/publishMessage');

const {isSameDay, createEmptyReport} = require('./utils/reportUtils');

const {
  getLatestNReports,
  saveReport,
} = require('./persistence/index');


/**
 * Check report, do book-keeping and trigger notification if needed.
 *
 * @param newReport
 * @return {Promise<void>}
 */
const analyzeMsg = async newReport => {
  console.log('Analyzing', JSON.stringify(newReport));
  console.log('hits', newReport.hits);
  const storageRecord = await getLatestNReports(1);
  const lastReport = storageRecord && storageRecord.length > 0 ? storageRecord[0].report : createEmptyReport();
  console.log('lastReport', JSON.stringify(lastReport));
  
  if ((lastReport.md5 !== newReport.md5)
    && isSameDay(newReport, lastReport)) {
    // Ok, so we now know we have a report which is different from last time.
    // If the day rolled over, the report will be different, but we don't want to be notified about it,
    // but we got here, so the report changed and it is worth while notifying about it.
    publishNotificationMessage(newReport);
    return saveReport(newReport);
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
