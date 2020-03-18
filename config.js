const config = {
  "production": {},
  "development": {},
  "all": {
    namesFile: "../names.csv",
    defaultName: "United Kingdom"
  }
};

module.exports = { ...config['all'], ...config[process.env.NODE_ENV || 'development'] };
