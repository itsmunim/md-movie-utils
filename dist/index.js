'use strict';

var clients = require('./clients');
var parser = require('./parser');

module.exports = {
  clients: clients,
  parser: new parser()
};