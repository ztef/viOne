/**
* A directed graph model node.
*
*
* @class VOne.GraphNode
* @constructor VOne.GraphNode
*
**/
VOne.GraphNode = function(nodeId){

	this.position = new THREE.Vector3(0, 0, 0);
	this.force = new THREE.Vector3(0, 0, 0);
	this.id = nodeId; 
	this.label = "node_x";
	this.graph = null;
	this.type = undefined;

};



VOne.GraphNode.prototype = {

	constructor: VOne.GraphNode,
 

	getVector: function(node){

		if(!node){

			console.log('no node');
			return;

		}

		var vector = node.position.clone();
		vector.sub(this.position);
		return vector;

	},


	atOrigin: function(){

		return this.position.x == 0 && this.position.y == 0 && this.position.z == 0;

	},
	

	getOutgoing: function(){

		return this.graph.getOutgoing(this);

	},
	

	getIncoming: function(){

		return this.graph.getIncoming(this);

	},
	

	getEdges: function(){

		return this.graph.getEdges(this);

	},


	
	getChildren: function(){

		var children = [];

		var outgoing = this.getOutgoing();

		outgoing.forEach(function(edge, index){

			if (children.indexOf(edge.to) == -1){

				children.push(edge.to);

			}

		});

		return children;
	},



	
	getParents: function(){

		var parents = [];

		var incoming = this.getIncoming();


		incoming.forEach(function(edge, index){

			var parent = edge.from;

			if (parents.indexOf(parent) == -1){

				parents.push(parent);

			}

		});


		return parents;
	
	},
	

	isSource: function(){

		return this.graph.isSource(this); 

	},

	
	isTarget: function(){

		return this.graph.isTarget(this); 

	},


	setLabel: function(label){

		this.label = label;

	},


	setType: function(type){

		this.type = type;

	},


	update: function(){

	}

};