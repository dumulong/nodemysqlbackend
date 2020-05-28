const util = require( 'util' );
const mysql = require( 'mysql' );

//Taken from https://codeburst.io/node-js-mysql-and-async-await-6fb25b01b628

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
  multipleStatements: true,
};

function getDb() {
  const connection = mysql.createConnection( config );
  return {
    query( sql, args ) {
      return util.promisify( connection.query )
        .call( connection, sql, args );
    },
    beginTransaction() {
      return util.promisify( connection.beginTransaction )
        .call( connection );
    },
    commit() {
      return util.promisify( connection.commit )
        .call( connection );
    },
    rollback() {
      return util.promisify( connection.rollback )
        .call( connection );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}

module.exports = getDb;