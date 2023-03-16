import mysql from 'mysql2';

const pool = mysql.createPool({
  host: "192.168.1.178",
  user: 'root',
  password: 'rootpass',
  database: 'test',
  port: 3306 // You need to change this and put in the correct port number.
});

// pool.getConnection((err, connection) => {
//   if(err) throw err;

//   console.log('connected from dbconfig.ts')
// });

export default pool;
// module.exports = pool;