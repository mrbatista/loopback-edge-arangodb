import 'chai/register-should';
import {DataSource, ModelBuilder} from 'loopback-datasource-juggler';
import Memory from 'loopback-datasource-juggler/lib/connectors/memory';

import edge from '../src/edge';

const modelBuilder = new ModelBuilder();
const mixins = modelBuilder.mixins;

describe('Edge', () => {
  const memory = new DataSource('memory', {connector: Memory}, modelBuilder);
  mixins.define('Edge', edge);

  it('default name for fields _id, _from and _to', () => {
    const Friend = memory.createModel('Friend',
      {name: String, type: String},
      {mixins: {Edge: true}}
    );
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
    const CustomFriend = memory.createModel('CustomFriend',
      {name: String, type: String},
      {mixins: {Edge: {_id: 'completeId', _from: 'from', _to: 'to'}}}
    );
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
});

