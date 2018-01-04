import ArangoDBConnector from 'loopback-connector-arangodb';
import {DataSource, ModelBuilder} from 'loopback-datasource-juggler';
import loopback from 'loopback';
import request from 'supertest';

import './should';

import edge from '../src/edge';

const modelBuilder = new ModelBuilder();
const mixins = modelBuilder.mixins;

describe('Edge', () => {
  const verticesEdges = {nodeId: 'Person/a', count: 3};
  const verticesInEdges = {nodeId: 'Person/d', count: 2};
  const verticesOutEdges = {nodeId: 'Person/c', count: 1};
  const verticesData = [
    {id: 'a'},
    {id: 'c'},
    {id: 'd'},
  ];
  const edgesData = [
    {id: 'x', _from: 'Person/a', _to: 'Person/b'},
    {id: 'y', _from: 'Person/b', _to: 'Person/d'},
    {id: 'z', _from: 'Person/c', _to: 'Person/a'},
    {id: 'h', _from: 'Person/a', _to: 'Person/d'},
  ];

  const arangodb = new DataSource('arangodb', {connector: ArangoDBConnector},
    modelBuilder);

  mixins.define('Edge', edge);

  const Person = arangodb.createModel('Person', {}, {forceId: false});
  const Friend = arangodb.createModel('Friend',
    {
      name: String,
      type: {type: Number, default: 1},
      created: {type: Date, defaultFn: 'now'},
    },
    {forceId: false, arangodb: {edge: true}, mixins: {Edge: true}}
  );
  const CustomFriend = arangodb.createModel('CustomFriend',
    {
      name: String,
      type: {type: Number, default: 1},
      created: {type: Date, defaultFn: 'now'},
    },
    {
      forceId: false,
      arangodb: {collection: 'Friend', edge: true},
      mixins: {Edge: {_id: 'completeId', _from: 'from', _to: 'to'}},
    }
  );
  const FriendCustomId = arangodb.createModel('FriendCustomId',
    {
      _key: {type: String, id: true},
      name: String,
      type: {type: Number, default: 1},
      created: {type: Date, defaultFn: 'now'},
    },
    {
      arangodb: {collection: 'Friend', edge: true},
      mixins: {Edge: true},
    }
  );

  async function createSampleData() {
    await Person.create(verticesData);
    return Friend.create(edgesData);
  }

  async function destroySampleData() {
    await Person.destroyAll();
    return Friend.destroyAll();
  }

  before(async () => {
    await arangodb.automigrate();
    return createSampleData();
  });

  after(() => destroySampleData());

  it('default name for fields _id, _from and _to', () => {
    const properties = Friend.definition.properties;
    const _id = properties._id;
    should.exist(_id);
    _id.type.should.be.equal(String);
    _id._id.should.be.equal(true);
    const _from = properties._from;
    should.exist(_from);
    _from.type.should.be.equal(String);
    _from.required.should.equal(true);
    _from._from.should.be.equal(true);
    const _to = properties._to;
    should.exist(_to);
    _to.type.should.be.equal(String);
    _to.required.should.equal(true);
    _to._to.should.be.equal(true);
  });

  it('custom name for fields _id, _from and _to', () => {
    const properties = CustomFriend.definition.properties;
    const completeId = properties.completeId;
    should.exist(completeId);
    completeId.type.should.be.equal(String);
    completeId._id.should.be.equal(true);
    const from = properties.from;
    should.exist(from);
    from.type.should.be.equal(String);
    from.required.should.equal(true);
    from._from.should.be.equal(true);
    const to = properties.to;
    should.exist(to);
    to.type.should.be.equal(String);
    to.required.should.equal(true);
    to._to.should.be.equal(true);
  });

  describe('Edge.edges', () => {
    it('default fields', async() => {
      const edges = await Friend.edges(verticesEdges.nodeId);
      edges.length.should.be.equal(verticesEdges.count);
      const edge = edges[0];
      edge.id.should.exist();
      edge._id.should.exist();
      edge._from.should.exist();
      edge._to.should.exist();
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });

    it('custom fields', async() => {
      const edges = await CustomFriend.edges(verticesEdges.nodeId);
      edges.length.should.be.equal(verticesEdges.count);
      const edge = edges[0];
      edge.id.should.exist();
      edge.completeId.should.exist();
      should.not.exist(edge._id);
      edge.from.should.exist();
      should.not.exist(edge._from);
      edge.to.should.exist();
      should.not.exist(edge._to);
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });

    it('custom id', async() => {
      const edges = await FriendCustomId.edges(verticesEdges.nodeId);
      edges.length.should.be.equal(verticesEdges.count);
      const edge = edges[0];
      edge._key.should.exist();
      should.not.exist(edge.id);
      edge._id.should.exist();
      edge._from.should.exist();
      edge._to.should.exist();
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });
  });

  describe('Edge.inEdges', () => {
    it('default field', async() => {
      const inEdges = await Friend.inEdges(verticesInEdges.nodeId);
      inEdges.length.should.be.equal(verticesInEdges.count);
      const edge = inEdges[0];
      edge.id.should.exist();
      edge._id.should.exist();
      edge._from.should.exist();
      edge._to.should.exist();
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });

    it('custom fields', async() => {
      const inEdges = await CustomFriend.inEdges(verticesInEdges.nodeId);
      inEdges.length.should.be.equal(verticesInEdges.count);
      const edge = inEdges[0];
      edge.id.should.exist();
      edge.completeId.should.exist();
      should.not.exist(edge._id);
      edge.from.should.exist();
      should.not.exist(edge._from);
      edge.to.should.exist();
      should.not.exist(edge._to);
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });
  });

  describe('Edge.outEdges', () => {
    it('default fields', async() => {
      const outEdges = await Friend.outEdges(verticesOutEdges.nodeId);
      outEdges.length.should.be.equal(verticesOutEdges.count);
      const edge = outEdges[0];
      edge.should.be.instanceof(Friend);
      edge.id.should.exist();
      edge._id.should.exist();
      edge._from.should.exist();
      edge._to.should.exist();
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });

    it('custom fields', async() => {
      const outEdges = await CustomFriend.outEdges(verticesOutEdges.nodeId);
      outEdges.length.should.be.equal(verticesOutEdges.count);
      const edge = outEdges[0];
      edge.should.be.instanceof(CustomFriend);
      edge.id.should.exist();
      edge.completeId.should.exist();
      should.not.exist(edge._id);
      edge.from.should.exist();
      should.not.exist(edge._from);
      edge.to.should.exist();
      should.not.exist(edge._to);
      edge.type.should.a('number');
      edge.created.should.a('date');
      should.not.exist(edge._key);
      should.not.exist(edge._rev);
    });
  });

  describe('Edge.traversal', () => {
    it('startVertex is required', async() => {
      try {
        await Friend.traversal({});
      } catch (err) {
        err.should.be.instanceof(Error);
        err.code.should.equal('START_VERTEX_IS_REQUIRED');
        err.statusCode.should.equal(400);
      }
    });

    it('outbound traversal', async() => {
      const outbound = await Friend
        .traversal({startVertex: verticesEdges.nodeId, direction: 'outbound'});
      outbound.visited.should.exist();
      const visited = outbound.visited;
      visited.vertices.should.exist();
      visited.paths.should.exist();
    });
  });

  describe('REST API', async() => {
    let app, server;

    before((done) => {
      app = loopback();
      app.use('/api', loopback.rest());

      app.loopback.modelBuilder.mixins.define('Edge', edge);
      const ds = loopback.createDataSource({connector: ArangoDBConnector});
      const Friend = ds.createModel('Friend', {}, {
        arangodb: {edge: true},
        mixins: {Edge: true},
      });
      app.model(Friend);
      server = app.listen(() => {
        done();
      });
    });

    after(() => {
      server.close();
    });

    it('Expose edges method', async() => {
      const nodeId = verticesEdges.nodeId;
      const res = await request(app).get(`/api/Friends/edges?nodeId=${nodeId}`);
      const edges = res.body;
      edges.length.should.be.equal(verticesEdges.count);
    });

    it('Expose inEdges method', async() => {
      const nodeId = verticesInEdges.nodeId;
      const res = await request(app)
        .get(`/api/Friends/inEdges?nodeId=${nodeId}`);
      const inEdges = res.body;
      inEdges.length.should.be.equal(verticesInEdges.count);
    });

    it('Expose outEdges method', async() => {
      const nodeId = verticesOutEdges.nodeId;
      const res = await request(app)
        .get(`/api/Friends/outEdges?nodeId=${nodeId}`);
      const outEdges = res.body;
      outEdges.length.should.be.equal(verticesOutEdges.count);
    });

    it('Expose traversal method', async() => {
      const nodeId = verticesOutEdges.nodeId;
      const graphOptions = JSON.stringify({
        startVertex: nodeId,
        direction: 'outbound',
      });
      const res = await request(app)
        .get(`/api/Friends/traversal?graphOptions=${graphOptions}`);
      const outbound = res.body;
      outbound.visited.should.exist();
      const visited = outbound.visited;
      visited.vertices.should.exist();
      visited.paths.should.exist();
    });
  });
});

