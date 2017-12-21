const c_process = require('child_process');

const nodemon = require('nodemon');
const chokidar = require('chokidar');

const logger = require('./logger.js');
process.on('SIGINT', process.exit);

/* 
 * Server
 */
const startServer = (() => {
  let isRunning = false;
  
  return () => {
    if (isRunning) return;
    isRunning = true;
    nodemon({ script: 'server/server.js', args: ['--inspect'], watch: 'server/server.js' })
    .once('start', () => logger.start('Develoment server started'))
    .on('restart', () => logger.end('Develoment server restarted'))
    .on('quit', () => {
      isRunning = false;
      process.exit();
    });
  }
})();
const compileServer = () => {
  const promise = new Promise((resolve, reject) => {
    c_process.exec('npm run build::server', {}, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      };
      resolve(stdout);
    });
  });
  promise.then((stdout) => {
    startServer();
    console.log(stdout);
  }, (stderr) => {
    console.log('error');
    console.log(stderr);
  });
}

// watch /src/server
const watchServerDir = () => {
  const watcher = chokidar.watch(['server']);
  watcher.on('ready', () => {
    compileServer();
    watcher
    .on('add', compileServer)
    .on('addDir', compileServer)
    .on('change', compileServer)
    .on('unlink', compileServer)
    .on('unlinkDir', compileServer);
  });
}

watchServerDir();
