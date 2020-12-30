'use strict';

const express = require('express');
const asyncHandler = require('express-async-handler'); // See https://zellwk.com/blog/async-await-express
const rateLimit = require("express-rate-limit");
const getObservations = require('./src/scraper').getObservations;


// Constants. Can be hard coded, since it will be running inside Docker container
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
//app.set('trust proxy', 1);

// See https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 16 // limit each IP to NN requests per windowMs
});
app.use(limiter);

app.get('/trigger-scrape', asyncHandler(async (req, res) => {
    await getObservations();
    res.send('ok');
}));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
