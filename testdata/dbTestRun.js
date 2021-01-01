const {
  getLatestNReports,
  saveReport,
} = require('./../src/persistence/index');
const {createEmptyReport} = require('../src/utils/reportUtils');

console.log('Connecting to database and saving a report');

void (async () => {
  await saveReport(createEmptyReport());
  const res = await getLatestNReports(1);
  let md5 = res[0].report.md5;
  console.log('Retrieving reports', md5);
})();
