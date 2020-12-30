const { analyzeObservations } = require('./analyzer');
const { notifyAll } = require('./notifier');

// Multiple functions: https://stackoverflow.com/questions/52732672/how-to-deploy-multiple-functions-using-gcloud-command-line

module.exports = {
  analyzeObservations,
  notifyAll
};
