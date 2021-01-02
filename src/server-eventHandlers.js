'use strict';

const express = require('express');
const asyncHandler = require('express-async-handler'); // See https://zellwk.com/blog/async-await-express
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const {isObservationMessage} = require('./utils/publishMessage');
const {analyzeObservations} = require('./analyzer');
const {notifyAll} = require('./notifier');

// Constants. Can be hard coded, since it will be running inside Docker container
const PORT = 8080;
const HOST = '0.0.0.0';

const handleMessage = async msg => {
  if (isObservationMessage(msg))
    return analyzeObservations(msg, {});
  else
   return notifyAll(msg, {});
};


const app = express();
//app.set('trust proxy', 1);
app.use(bodyParser.json());

// See https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 16 // limit each IP to NN requests per windowMs
});
app.use(limiter);

// Lifted from https://cloud.google.com/run/docs/tutorials/pubsub#looking_at_the_code
app.post('/', asyncHandler(async (req, res) => {
  if (!req.body) {
    const msg = 'no Pub/Sub message received';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = 'invalid Pub/Sub message format';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  
  const pubSubMessage = req.body.message;
  await handleMessage(pubSubMessage);
  /*
  const msgData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : createEmptyReport();
  console.log(`Hello ${name}!`);
   */
  
  res.status(204).send();
}));


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
