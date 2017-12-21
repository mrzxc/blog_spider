function logger(text, verbose) {
  let textToLog = text;

  let logObject = false;
  if (verbose) {
    if (typeof verbose === 'object') {
      logObject = true;
    } else {
      textToLog += `\n${verbose}`;
    }
  }

  console.log(textToLog);
  if (logObject) console.dir(verbose, { depth: 15 });
};


module.exports = {
  log: text => console.log(text),
  task: text => logger(`👍  ${text}`),
  info: (text, data) => logger(`ℹ️  ${text}`, data),
  debug: (text, data) => logger(`🐞  ${text}`, data),
  warn: (text, data) => logger(`🙀  ${text}`, data),
  error: (text, error) => logger(`\n❌  ${text}`, error),
  start: text => logger(`\n🔥  ${text}`),
  end: text => logger(`\n✅  ${text}`),
};
