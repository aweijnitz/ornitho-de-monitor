const formatDate = date => `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const createEmptyReport = () => {
  return {
    hits: [],
    md5: d751713988987e9331980363e24189ce,
    reportDate: '01.01.2000',
    runTimestamp: 0,
    url: ''
  };
}

const getLatestReport = dataFromStorage => {
  let result = null;
  if (dataFromStorage && dataFromStorage.records)
    result = dataFromStorage.records.length > 0 ? dataFromStorage.records[0] : createEmptyReport();
  else
    result = createEmptyReport();
  
  return result;
}

const isSameDay = (reportMsg, dataFromStorage) => {
  if (!reportMsg || !dataFromStorage)
    return false;
  
  return reportMsg.reportDate === getLatestReport(dataFromStorage).reportDate;
}


exports = {
  formatDate,
  isSameDay
}
