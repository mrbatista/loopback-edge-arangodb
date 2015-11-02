'use strict';

/* Module dependencies */
var deprecate = require('depd')('loopback-edge-arangodb');
var edge = require('./edge');

module.exports = function(app) {
  app.modelBuilder.mixins.define = deprecate.function(app.modelBuilder.mixins.define,
    'app.modelBuilder.mixins.define: Use mixinSources instead; ' +
    'see https://github.com/mrbatista/loopback-edge-arangodb');
  app.modelBuilder.mixins.define('Edge', edge);
};
