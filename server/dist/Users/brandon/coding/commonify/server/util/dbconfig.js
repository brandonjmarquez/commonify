import mysql from 'mysql2';
const pool = mysql.createPool({
    host: '192.168.1.104',
    user: 'root',
    password: 'rootpass',
    database: 'test',
    port: 3306
});
export default pool;
//# sourceMappingURL=dbconfig.js.map