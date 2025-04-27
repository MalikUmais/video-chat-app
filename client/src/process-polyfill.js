// Create this file in your src directory
// This polyfills the process object for browser environment

window.process = window.process || {};
window.process.nextTick = function (callback) {
    setTimeout(callback, 0);
};

window.process.env = window.process.env || {};
window.process.env.NODE_ENV = process.env.NODE_ENV || 'development';