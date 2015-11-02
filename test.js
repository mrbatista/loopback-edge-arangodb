'use strict';

/* Module dependencies */
var should = require('should');
var app = require('loopback');

// Import our Edge mixin
require('./')(app);

var ds = app.createDataSource({
    connector: app.Memory
});

describe('loopback edge arangodb', function() {

    var Friend = ds.createModel('Friend',
        {name: String, type: String},
        {mixins: {Edge: true}}
    );

    var CustomFriend = ds.createModel('CustomFriend',
        {name: String, type: String},
        {mixins: {Edge: { _id: 'completeId', _from: 'from', _to: 'to'}}}
    );

    it('default name for fields _id, _from and _to', function(done) {
        var properties = Friend.definition.properties;
        var _id = properties._id;
        should.exist(_id);
        _id.type.should.be.String;
        var _from = properties._from;
        should.exist(_from);
        _from.type.should.be.String;
        _from.required.should.equal(true);
        var _to = properties._to;
        should.exist(_to);
        _to.type.should.be.String;
        _to.required.should.equal(true);
        done();
    });

    it('custom name for fields _id, _from and _to', function(done) {
        var properties = CustomFriend.definition.properties;
        var completeId = properties.completeId;
        should.exist(completeId);
        completeId.type.should.be.String;
        var from = properties.from;
        should.exist(from);
        from.type.should.be.String;
        from.required.should.equal(true);
        var to = properties.to;
        should.exist(to);
        to.type.should.be.String;
        to.required.should.equal(true);
        done();
    });
});

