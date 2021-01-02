const {renderReport} = require('./template');
const {storeHTML} = require('../persistence/storageUtils');

const publishHTMLReport = async reportMsg => {
  console.log('Uploading new report');
  const reportHTML = renderReport(reportMsg);
  return storeHTML(reportHTML);
}

module.exports = {
  publishHTMLReport
}
