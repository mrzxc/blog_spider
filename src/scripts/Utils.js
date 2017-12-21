import mysql from 'mysql';

export const Utils = {
  _mysqlConnection() {
    const connection = mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'zxc',
      port: '3306',
      database: 'blog',
    });
    return  new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(err);
        }
        console.log('[connection connect] succeed!');
      });
      resolve(connection);
    })
  },
  _mysqlQuery(query, params = null) {
    return this._mysqlConnection().then((connection) => {
      const result = new Promise((resolve, reject) => {
        connection.query(query, [params], (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      connection.end();
      return result;
    }, (err) => {
      console.log('[connect] - :' + err);
    }); 
  },
  saveSite(params) {
     const query = 'INSERT INTO site (url) VALUES ?'; 
     return this._mysqlQuery(query, params).then((result) => {
       return result;
     }, (err) => {
       console.log('[query] - ' + err);
     });
  },
  saveUrl(params) {
    const query = 'INSERT INTO url (site, url) VALUES ?';
    return this._mysqlQuery(query, params).then((result) => {
       return result;
     }, (err) => {
       console.log('[query] - ' + err);
     });
  },
  saveUrlRelations(params) {
    const query = 'INSERT INTO urlToUrl (site, origin, destination) VALUES ?';
    return this._mysqlQuery(query, params).then((result) => {
       return result;
     }, (err) => {
       console.log('[query] - ' + err);
     });
  }
}
