const {
  isNotificaitonMessage
} = require('./utils/publishMessage')

const processMsg = async msgPayload => {
  console.log('Notifier checking message', JSON.stringify(msgPayload));
  console.log('Nr hits', msgPayload.hits.length);
  
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
exports.notifyAll = async (message, context) => {
  console.log('NOTIFIER TRIGGERED!', JSON.stringify(message), JSON.stringify(context));
  
  if (!isNotificaitonMessage(message)) {
    console.log('Notifier skipping message.', message);
    return;
  }
  const payload = message.data
    ? Buffer.from(message.data, 'base64').toString()
    : false;
  
  if (payload !== false)
    return await processMsg(JSON.parse(payload));
};
