[![NPM](https://nodei.co/npm/loopback-edge-arangodb.png?compact=true)](https://nodei.co/npm/loopback-edge-arangodb/)

loopback-edge-arangodb
=============

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework.  It adds `_id`, `_from` and `_to` attributes to any Model.

`_id` A document handle uniquely identifies a document in the database. It is a string and consists of the collection's name and the document key (`_key` attribute) separated by /.

`_from` A document handle that identifies the start-point of the edge.

`_to` A document handle that identifies the end-point of the edge.

Install
=============

```bash
  npm install --save loopback-edge-arangodb
```

Mixin sources
=============

With [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/)  [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) have been implemented in a way which allows for loading this mixin without changes to the `server.js` file previously required.

Add the `mixins` property to your `server/model-config.json` like the following:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-edge-arangodb/mixins",
      "../common/mixins"
    ]
  }
}
```

Configuration
=============

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "Friend",
    "properties": {
      "label": {
        "type": "string",
      }
    },
    "mixins": {
      "Edge" : true
    }
  }
```

Custom options
=============

The attribute names `_id`, `_from` and `_to` are configurable.  To use different values for the default attribute names add the following parameters to the mixin options.

This attributes are `required` by default.

In this example we change `_id`, `_from` and `_to` to `completeId`, `from` and `to`, respectively.

```json
  {
    "name": "Friend",
    "properties": {
      "label": {
        "type": "string",
      }
    },
    "mixins": {
      "Edge" : {
        "_id" : "completeId",
        "_from" : "from",
        "_to": "to"
      }
    }
  }
```

Running tests
=============

The tests in this repository are mainly integration tests, meaning you will need
to run them using our preconfigured test server.

Run the tests:

```bash
  npm test
```

Run with debugging output:

```bash
  DEBUG='loopback:mixins:edge-arangodb' npm test
```

License
=============

[MIT](LICENSE)
