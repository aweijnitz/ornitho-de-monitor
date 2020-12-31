const {PubSub} = require('@google-cloud/pubsub');
const TYPE_NOTIFICATION = 'notification';
const TYPE_OBSERVATION = 'observations';


// Setup pub sub
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'GOOGLE_CLOUD_PROJECT_NOT_SET';
const topicName = process.env.PUBSUB_TOPIC || 'PUBSUB_TOPIC_NOT_SET';
const pubSubClient = new PubSub({projectId});


const publishMessage = async (msgObj, msgType) => {
  //const dataBuffer = Buffer.from(JSON.stringify(msgObj));
  try {
    const attributes = {
      type: msgType
    };
    const messageId = await pubSubClient.topic(topicName).publishJSON(msgObj, attributes); // https://googleapis.dev/nodejs/pubsub/latest/Topic.html#publishJSON
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}

exports.isObservationMessage = message => {
  const type = message.attributes ? message.attributes.type : false;
  return type === TYPE_OBSERVATION;
}

exports.isNotificaitonMessage = message => {
  const type = message.attributes ? message.attributes.type : false;
  return type === TYPE_NOTIFICATION;
}

exports.publishMessage = publishMessage
exports.publishNotificationMessage = async msgPayload => {
  return publishMessage(msgPayload, TYPE_NOTIFICATION);
}
exports.publishObservationsMessage = async msgPayload => {
  return publishMessage(msgPayload, TYPE_OBSERVATION);
}
