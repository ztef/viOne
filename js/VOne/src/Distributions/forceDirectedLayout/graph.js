/**
* A directed graph model.
*
*
* @class VOne.Graph
* @constructor VOne.Graph
*
**/
VOne.Graph = function(){

	/**
	* An array conaining the graph nodes. 
	*
	* @property nodes
	* @type {VOne.GraphNode Array}
	* 
	**/
	this.nodes = [];

	/**
	* An array conaining the graph relations (edges). 
	*
	* @property edges
	* @type {VOne.GraphEdge Array}
	* 
	**/
	this.edges = [];


	/**
	* An associative array conaining the graph nodes by id. 
	*
	* @property nodeIdMap
	* @type {Object}
	* 
	**/
	this.nodeIdMap = {};


	this.nodeIdentifierMap = {};
	this.relationships = {};
	this.maxId = 0;

	/**
	* Center position for the graphic graph representation. 
	*
	* @property startingPosition
	* @type {THREE.Vector3}
	* 
	**/
	this.startingPosition = new THREE.Vector3(0,0,0);
	this.changed = false;

};



VOne.Graph.prototype = {

	constructor : VOne.Graph,
	

	/**
	* Adds a VOne.GraphNode to the graph model.
	*
	* @method addNode 
	* @param {VOne.GraphNode} node The node to be added to the model.
	**/
	addNode: function (node){

		this.nodes.push(node);

		this.nodeIdMap['n' + node.id] = node;

		if (node.identifier) 
			this.nodeIdentifierMap[node.identifier] = node;

		node.graph = this;

		this.maxId = Math.max(this.maxId, node.id);

		this.changed = true;

	},
	


	/**
	* Adds a VOne.GraphEdge to the graph model.
	*
	* @method addEdge 
	* @param {VOne.GraphEdge} edge The edge to be added to the graph model.
	**/
	addEdge: function (edge){

		this.edges.push(edge);

		edge.graph = this;

		this.changed = true;

		return edge;

	},
	
	
	/**
	* Searches for a VOne.GraphNode in the graph model.
	*
	* @method getNodeById 
	* @param {String} nodeId The VOne.GraphNode id.
	* @return {VOne.GraphNode} The VOne.GraphNode with the given id.
	**/
	getNodeById: function (id){

		return this.nodeIdMap['n' + id];

	},
	
	
	
	/**
	* Searches for a VOne.GraphEdge in the graph model.
	*
	* @method findEdge 
	* @param {VOne.GraphNode} souceNode The VOne.GraphNode edge source.
	* @param {VOne.GraphNode} targetNode The VOne.GraphNode edge target.
	* @return {VOne.GraphEdge} The VOne.GraphEdge that connects the given nodes.
	**/
	findEdge: function (sourceNode, targetNode){

		for (var i = 0; i < this.edges.length; i++){

			var edge = this.edges[i];

			if (edge.from == sourceNode && edge.to == targetNode){
				
				return edge;

			}

		}

		return false;

	},


	/**
	* Searches for a VOne.GraphNode in the graph model. If no node is found, creates a new VOne.GraphNode with the given id.
	*
	* @method findOrCreateNode 
	* @param {String} nodeId The VOne.GraphNode id to be found or created.
	* @return {VOne.GraphNode} The found or created VOne.GraphNode.
	**/
	findOrCreateNode: function(nodeId){

		var node = this.getNodeById(nodeId);

		if(!node){

			node = new VOne.GraphNode(nodeId);

			this.addNode(node);

		}


		

		return node;

	},


	/**
	* Searches for a VOne.GraphEdge in the graph model. If no edge is found, a new VOne.GraphEdge is created.
	*
	* @method findOrCreateEdge 
	* @param {VOne.GraphNode} sourceNode The edge's source VOne.GraphNode.
	* @param {VOne.GraphNode} targetNode The edge's target VOne.GraphNode.
	* @return {VOne.GraphEdge} The found or created VOne.GraphEdge.
	**/
	findOrCreateEdge: function(sourceNode, targetNode){

		var edge = this.findEdge(sourceNode, targetNode);

		if (edge) 
			return edge;


		edge = new VOne.GraphEdge(sourceNode, targetNode);

		this.addEdge(edge);

		return edge;

	},
	

	/**
	* Gets all the outgoing edges for a given VOne.GraphNode.
	*
	* @method getOutgoingEdges 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All outgoing edges from the given node.
	**/
	getOutgoingEdges: function(node){

		var outgoingEdges = [];

		this.edges.forEach(function(edge, index){

			if(edge.from == node && outgoingEdges.indexOf(edge) == -1){

				outgoingEdges.push(edge);

			}

		});

		return outgoingEdges;

	},

	
	/**
	* Gets all the incoming edges for a given VOne.GraphNode.
	*
	* @method getIncoming 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All incoming edges to the given node.
	**/
	getIncoming: function(node){

		var incomingEdges = [];

		this.edges.forEach(function(edge, index){

			if(edge.to == node && incomingEdges.indexOf(edge) == -1){

				incomingEdges.push(edge);

			}

		});

		return incomingEdges;

	},


	
	/**
	* Gets all the incoming and outgoing edges for a given VOne.GraphNode.
	*
	* @method getEdges 
	* @param {VOne.GraphNode} node The node.
	* @return {[VOne.GraphEdge]} All incoming and outgoing edges related to the given node.
	**/
	getEdges: function(node){

		var nodeEdges = [];

		this.edges.forEach(function(edge, index){

			if((edge.from == node || edge.to == node) && nodeEdges.indexOf(edge) == -1){

				nodeEdges.push(edge);

			}

		});

		return nodeEdges;
	},

	
	/**
	* Gets all the nodes with incoming edges.
	*
	* @method getTargetNodes 
	* @return {[VOne.GraphNode]} All nodes with incoming edges.
	**/
	getTargetNodes: function(){

		var targetNodes = [];

		this.nodes.forEach(function(node, index){

			if (node.isTarget()){

				targetNodes.push(node);

			}

		});

		return targetNodes;

	},


	/**
	* Gets all the nodes with outgoing edges.
	*
	* @method getSources 
	* @return {[VOne.GraphNode]} All nodes with outgoing edges.
	**/
	getSources: function(){
		var sources = [];
		$.each(this.nodes, function(index, node){
			if (node.isSource(node)){
				sources.push(node);
			}
		});
		return sources;
	},
	

	/**
	* Determines if a given node is a last target node (a node without outgoing edges).
	*
	* @method isLastTarget 
	* @return {Boolean} True if node is last target. False otherwise.
	**/
	isLastTarget: function(node){

		this.edges.forEach(function(edge, index){

			if (edge.from == node){

				return false;

			}

		});

		return true;
	},

	
	/**
	* Determines if a given node is a source node (a node without incoming edges).
	*
	* @method isSource 
	* @return {Boolean} True if node is source. False otherwise.
	**/
	isSource: function(node){

		this.edges.forEach(function(edge, index){

			if (edge.to == node){

				return false;

			}

		});

		return true;
	}

};