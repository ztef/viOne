var THREE = require('three');
var VOne = require('../dist/VOne.js');

var assert = require("assert");

describe('The VOne object', function() {
  it('should have a defined MeshClassName constant', function() {
    assert.notEqual('undefined', VOne.MeshClassName);
  }),

  it('should be able to construct a Graph with default of maxId = 0', function() {
    var graph = new VOne.Graph();
    assert.equal(0, graph.maxId);
  })
})