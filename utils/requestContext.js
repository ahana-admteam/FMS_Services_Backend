const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

const setRequestContext = (data, callback) => {
  asyncLocalStorage.run(data, callback);
};

const getRequestContext = () => {
  return asyncLocalStorage.getStore();
};

module.exports = {
  setRequestContext,
  getRequestContext
};