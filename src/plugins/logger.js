let log;

try {
  log = require('electron-log'); 

  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) { // Needed to make the chrome console to know the correct references in development mode
    console.log = (...args) => log.info(...args);
    console.error = (...args) => log.error(...args);
    console.warn = (...args) => log.warn(...args);
  }
} catch (e) {
  log = console; // fallback for non-Electron environments (like testing)
}

export default {
  install(app) {
    app.config.globalProperties.$log = log;
  },
};