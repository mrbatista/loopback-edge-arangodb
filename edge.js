'use strict';

var _ = require('underscore');
var debug = require('debug')('loopback:mixins:edge');

module.exports = function(model, options) {
    debug('Edge mixin for Model %s', model.modelName);
    options = _.extend({_id: '_id', _from: '_from', _to: '_to', required: true}, options);
    debug('options', options);

    model.defineProperty(options._id, {type: String});
    model.defineProperty(options._from, {type: String, required: options.required});
    model.defineProperty(options._to, {type: String, required: options.required});
};
