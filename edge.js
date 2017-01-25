'use strict';

var _ = require('underscore');
var debug = require('debug')('loopback:mixins:edge');

module.exports = function(model, options) {
  options = _.extend({_id: '_id', _from: '_from', _to: '_to'}, options);
  debug('Edge mixin for Model %s with options %s', model.modelName, options);

  model.defineProperty(options._id, {type: String});
  model.defineProperty(options._from, {type: String, required: true});
  model.defineProperty(options._to, {type: String, required: true});
};
