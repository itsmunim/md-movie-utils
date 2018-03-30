let clients = require('./clients');
let parser = require('./parser');

module.exports = {
  clients: clients,
  parser: new parser()
};
