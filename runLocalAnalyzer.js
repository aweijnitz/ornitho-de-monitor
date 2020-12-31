const analyzeObservations = require('./src/analyzer').analyzeObservations;
const createEmptyReport = require('./src/utils/reportUtils').createEmptyReport;

analyzeObservations({
  attributes: {
    type: 'observations'
  },
  message: {
    data: Buffer.from(JSON.stringify(createEmptyReport()))
  }
}, {}).then(() => {})
