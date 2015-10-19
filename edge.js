'use strict';

var debug = require('debug');

module.exports = function(Model, options) {

    debug('Edge mixin for Model %s', Model.modelName);

    options = Object.assign({_from: '_from', _to: '_to', required: true}, options);

    debug('options', options);

    Model.defineProperty(options._from, {type: String});
    Model.defineProperty(options._to, {type: String});
};
