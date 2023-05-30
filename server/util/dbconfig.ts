import mysql from 'mysql2';

const pool = mysql.createPool({
  host: '192.168.1.178',
  user: 'root',
  password: 'rootpass',
  database: 'commonify',
  port: 3306
});

export default pool;