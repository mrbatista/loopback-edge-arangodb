import assert from 'assert';
import debug from './debug';
import Promise from 'bluebird';

export default (Model, options) => {
  options = Object.assign({_id: '_id', _from: '_from', _to: '_to'}, options);
  debug('Edge mixin for Model %s with options %O', Model.modelName, options);

  Model.defineProperty(options._id, {type: String, _id: true});
  Model.defineProperty(options._from, {
    type: String,
    _from: true,
    required: true,
  });
  Model.defineProperty(options._to, {type: String, _to: true, required: true});

  /**
   * Build data from database to relative model
   * @param connector The connector
   * @param edges Array<model> The edges data
   * @returns {Array<Model>}
   */
  function buildModelFromDatabase(connector, edges) {
    const modelName = Model.modelName;
    const idName = connector.idName(modelName);
    const fullIdName = connector._fullIdName(modelName);
    const fromName = connector._fromName(modelName);
    const toName = connector._toName(modelName);
    edges = edges.map(edge => {
      delete edge._rev;

      connector._setFieldValue(edge, idName, edge._key);
      if (idName !== '_key') delete edge._key;

      connector._setFieldValue(edge, fullIdName, edge._id);
      if (fullIdName !== '_id') delete edge._id;

      connector._setFieldValue(edge, fromName, edge._from);
      if (fromName !== '_from') delete edge._from;

      connector._setFieldValue(edge, toName, edge._to);
      if (toName !== '_to') delete edge._to;

      edge = connector.fromDatabase(modelName, edge);

      return new Model(edge);
    });
    return edges;
  }

  /**
   * Retrieves a list of all edges of the document with the given nodeId.
   * @param nodeId {String} The _id property of arangoDB document
   * @param options {Object} The options object
   * @returns {Promise.<Model|Error>}
   */
  Model.edges = async function(nodeId, options) {
    const modelName = Model.modelName;
    const connector = this.getConnector();
    const collection = connector.getCollection(modelName);
    const edges = await collection.edges(nodeId);
    return buildModelFromDatabase(connector, edges);
  };

  /**
   * Retrieves a list of all incoming edges of the document with the given nodeId.
   * @param nodeId {String} The _id property of arangoDB document
   * @param options {Object}
   * @returns {Promise.<Model|Error>}
   */
  Model.inEdges = async function(nodeId, options) {
    const modelName = Model.modelName;
    const connector = this.getConnector();
    const collection = connector.getCollection(modelName);
    const edges = await collection.inEdges(nodeId);
    return buildModelFromDatabase(connector, edges);
  };

  /**
   * Retrieves a list of all outgoing edges of the document with the given nodeId.
   * @param nodeId {String} The _id property of arangoDB document
   * @param options {Object} The options object
   * @returns {Promise.<Model|Error>}
   */
  Model.outEdges = async function(nodeId, options) {
    const modelName = Model.modelName;
    const connector = this.getConnector();
    const collection = connector.getCollection(modelName);
    const edges = await collection.outEdges(nodeId);
    return buildModelFromDatabase(connector, edges);
  };

  /**
   * Performs a traversal starting from the given startVertex and following
   * edges contained in this edge collection.
   *
   * @param graphOptions {Object} The graph options
   * @property {String} startVertex The start vertex
   * @param options {Object} The options object
   * @returns {Promise.<Model|Error>}
   */
  Model.traversal = async function(graphOptions, options) {
    assert(typeof graphOptions === 'object', 'graphOptions must be an object');

    if (typeof graphOptions.startVertex !== 'string') {
      const err = new Error('startVertex is required');
      err.code = 'START_VERTEX_IS_REQUIRED';
      err.statusCode = 400;
      return Promise.reject(err);
    } else {
      const startVertex = graphOptions.startVertex;
      const modelName = Model.modelName;
      const connector = this.getConnector();
      const collection = connector.getCollection(modelName);
      return await collection.traversal(startVertex, graphOptions);
    }
  };

  if (typeof Model.remoteMethod === 'function') {
    Model.remoteMethod('edges', {
      description: `Retrieves a list of all ${Model.modelName} edges of the 
        document with the given documentHandle.`,
      accepts: [
        {
          arg: 'nodeId',
          type: 'string',
          description: 'The _id property of arangoDB document.',
          http: {source: 'query'},
          required: true,
        },
        {arg: 'options', type: 'object', http: 'optionsFromRequest'},
      ],
      http: {path: '/edges', verb: 'get'},
      returns: {arg: 'data', root: true, type: [Model.modelName]},
    });

    Model.remoteMethod('inEdges', {
      description: `Retrieves a list of all incoming ${Model.modelName} edges 
        of the document with the given documentHandle.`,
      accepts: [
        {
          arg: 'nodeId',
          type: 'string',
          description: 'The _id property of arangoDB document.',
          http: {source: 'query'},
          required: true,
        },
        {arg: 'options', type: 'object', http: 'optionsFromRequest'},
      ],
      http: {path: '/inEdges', verb: 'get'},
      returns: {arg: 'data', root: true, type: [Model.modelName]},
    });

    Model.remoteMethod('outEdges', {
      description: `Retrieves a list of all outgoing ${Model.modelName} edges
        of the document with the given documentHandle.`,
      accepts: [
        {
          arg: 'nodeId',
          type: 'string',
          description: 'The _id property of arangoDB document.',
          http: {source: 'query'},
          required: true,
        },
        {arg: 'options', type: 'object', http: 'optionsFromRequest'},
      ],
      http: {path: '/outEdges', verb: 'get'},
      returns: {arg: 'data', root: true, type: [Model.modelName]},
    });

    Model.remoteMethod('traversal', {
      description: `Performs a traversal starting from the given startVertex 
        and following edges contained in ${Model.modelName} edge collection.`,
      accepts: [
        {
          arg: 'graphOptions',
          type: 'object',
          http: {source: 'query'},
          required: true,
        },
        {arg: 'options', type: 'object', http: 'optionsFromRequest'},
      ],
      http: {path: '/traversal', verb: 'get'},
      returns: {arg: 'result', root: true, type: 'object'},
    });
  }
};
