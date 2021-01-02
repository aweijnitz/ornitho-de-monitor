const Knex = require('knex');

const {
  isProductionMode,
  currentRunMode
} = require('../utils/runtimeUtil');

const DATALOG_TABLE_NAME = 'datalog_' + currentRunMode();

const storageExists = async () => {
  return await knex.schema.hasTable(DATALOG_TABLE_NAME);
}

const createDataTable = () => {
  knex.schema.hasTable(DATALOG_TABLE_NAME).then(function (exists) {
    console.log('Exists: ', exists, DATALOG_TABLE_NAME, 'Database ', process.env.DB_NAME);
    if (!exists) {
      return knex.schema.createTable(DATALOG_TABLE_NAME, function (t) {
        t.increments('id').primary();
        t.timestamps();
        t.string('hash', 32);
        t.jsonb('report');
        console.log('table created', DATALOG_TABLE_NAME)
      });
    }
  });
}

const createUnixSocketPool = (connectionDetails, config) => {
  console.log('Initializing DB connection', 'Database:', process.env.DB_NAME, '. Using table', DATALOG_TABLE_NAME);
  // Establish a connection to the database
  return Knex({
    debug: true,
    pool: {min: 0, max: 8},
    client: 'pg',
    connection: connectionDetails,
    // ... Specify additional properties here.
    ...config,
  });
};

let knex = null;
createDataTable(); // Ensure table exists before processing messages

if (isProductionMode()) {
  const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
  knex = createUnixSocketPool({
    user: process.env.DB_USER, // e.g. 'my-user'
    password: process.env.DB_PASS, // e.g. 'my-user-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`
  });
} else {
  // Create local connection
  knex = createUnixSocketPool({
    user: process.env.DB_USER, // e.g. 'my-user'
    password: process.env.DB_PASS, // e.g. 'my-user-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host: `127.0.0.1`,
    port: 5432
  });
}

const getLatestNReports = async maxNumberReports => {
  console.log('getLatestNReports - fetching');
  return knex.from(DATALOG_TABLE_NAME)
    .select('hash', 'report')
    .orderBy('created_at', 'desc')
    .limit(maxNumberReports);
}

const _insertMsg = async reportMsg => {
  console.log('Inserting!', JSON.stringify(reportMsg));
  
  // See example usage of Knex + JSON here: https://gist.github.com/lucdew/10d7ab14a2b4db106285
  await knex(DATALOG_TABLE_NAME).insert({
    hash: reportMsg.md5,
    created_at: new Date(),
    updated_at: new Date(),
    report: JSON.stringify(reportMsg)
  });
  console.log('Inserting! DONE');
}

const saveReport = async reportMsg => {
  const exists = await storageExists();
  console.log('SAVING ENTRY. Table ready: ', exists, 'db: ', process.env.DB_NAME);
  await _insertMsg(reportMsg);
}

const dropTable = () => {
  return knex.schema.dropTable(DATALOG_TABLE_NAME);
}

module.exports = {
  getLatestNReports,
  saveReport,
  createDataTable,
  dropTable
}

