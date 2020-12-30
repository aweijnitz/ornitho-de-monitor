const analyzeMsg = msgPayload => {
  console.log('Analyzing', JSON.stringify(msgPayload));
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
exports.analyzeObservations = (message, context) => {
  console.log('ANALYZER TRIGGERED!', JSON.stringify(message), JSON.stringify(context));
  const msgType = message.attributes ? message.attributes.type : false;
  if(!msgType || msgType !== 'observations') {
    console.log('Analyzer skipping message.', msgType);
    return;
  }
  const payload = message.data
    ? Buffer.from(message.data, 'base64').toString()
    : false;
  if (payload != false)
    analyzeMsg(JSON.parse(payload));
};
