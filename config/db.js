const tunnel = require('tunnel-ssh');
const mysql = require('mysql2');

let pool = null;

const tunnelConfig = {
  username: 'pf',
  password: 'tkfkd2wpsZ0n@-^',
  host: '106.10.53.217',
  port: 22,
  dstHost: 'db-2qtk6.cdb.ntruss.com',
  dstPort: 3306,
  localHost: '127.0.0.1',
  localPort: 23306,
};

const dbConfig = {
  host: '127.0.0.1',
  port: 23306,
  user: 'hancomdbmobility',
  password: 'tkfid2di2wps!*!',
  database: 'parkingfriends',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

module.exports = {
  init() {
    pool = mysql.createPool(dbConfig);
    return pool;
  },

  connect(pool) {
    tunnel(tunnelConfig, (err, server) => {
      if (err) {
        console.error(`ssh tunnel connection error : ${err}`);
      } else {
        console.error('ssh tunnel is connected successfully!');

        pool.getConnection((err, conn) => {
          if (err) {
            console.error(`mysql connection error : ${err}`);
          } else {
            console.log('mysql is connected successfully!');
            conn.release();
          }
        });
      }
    });
  }
};
