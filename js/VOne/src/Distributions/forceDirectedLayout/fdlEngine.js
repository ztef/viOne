// Based on Stephen G. Kobourov published chapter on Handbook of Graph Drawing and Visualization		
// edited by Roberto Tamassia, University of Arizona

VOne.ForceDirectedLayoutEngine = function(graph, config){

	config = config || { };

	this.averageForceUpdateThreshold = config.averageForceUpdateThreshold || 0.001;
	this.repulsion = config.repulsion || 0.5;
	this.springConstant = config.springConstant || 0.4;
	this.maxForce = config.maxForce || 40.0;
	this.edgeLength = config.edgeLength || 400;
	this.dampingFactor = config.dampingFactor || 0.1;

	this.setGraph(graph);
	
};




VOne.ForceDirectedLayoutEngine.prototype = {

	constructor: VOne.ForceDirectedLayoutEngine,


	setGraph: function(graph){

		this.graph = graph;
		this.graph.changed = true;
		this.randomNodePositions();

	},


	clearForces: function(){


		this.graph.nodes.forEach(function(node, index){

			node.force.set(0, 0, 0);

		});
		
	},



	addRepulsiveForces: function(nodeA, nodeB){

		var vectorAB = nodeA.getVector(nodeB);

		var scaledEdgeLength = vectorAB.length() / this.edgeLength;

		
		if (scaledEdgeLength < 0.01) 

			scaledEdgeLength = 0.01


		var scale = this.repulsion / (scaledEdgeLength * scaledEdgeLength);

		this.addForce(nodeA, vectorAB, -1 * scale);	

		this.addForce(nodeB, vectorAB, scale);
		
	},



	step: function(){

		this.doFDLStep();
		this.doFDLStep();

	},


	doFDLStep: function(){

		this.clearForces();

		var me = this;


		var nodes = this.graph.nodes;
		

		var graphLength = nodes.length;

		
		nodes.forEach(function(nodeA, index){
		
			for (var i = index + 1; i < graphLength; i++){

				var nodeB = nodes[i];

				me.addRepulsiveForces(nodeA, nodeB);		

			}

		});
		
		


		var edges = this.graph.edges;

		
		this.graph.edges.forEach(function(edge, index){

			me.addEdgeForces(edge);

		});


		
		this.updateNodePositions();


	},


	randomNodePositions: function(){

		var that = this;

		
		this.graph.nodes.forEach(function(node, index){

			node.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			node.position.normalize();
			node.position.multiplyScalar( Math.random() * that.edgeLength );

			node.update();

		});
	},


	addForce: function(node, vector, scalar){

		node.force.x = node.force.x + vector.x * scalar;
		node.force.y = node.force.y + vector.y * scalar;
		node.force.z = node.force.z + vector.z * scalar;

	},



	getAverageForce: function(){


		var graphTotalForce = 0;


		this.graph.nodes.forEach(function(node, index){

			graphTotalForce += node.force.length();

		});

		
		return graphTotalForce / this.graph.nodes.length;

	},



	addEdgeForces: function(edge){

		var originNode = edge.from;

		var targetNode = edge.to;

		var vectorAB = originNode.getVector(targetNode);

		var edgeLength = edge.defaultLength || this.edgeLength;

		var displacement = vectorAB.length() - edgeLength;


		if (displacement > 0.1){

			var scalar = this.springConstant * displacement;

			this.addForce(originNode, vectorAB, scalar);

			this.addForce(targetNode, vectorAB, -1 * scalar);

		}

	},



	updateNodePositions: function(){

		var me = this;


		this.graph.nodes.forEach(function(node, index){


			var forceLength = node.force.length();


			var force = node.force.clone();


			if (forceLength > me.maxForce) 

				forceLength = me.maxForce;
		

			force.normalize();

			
			force.multiplyScalar(forceLength * me.dampingFactor);

			
			node.position.add(force);


			node.update();
			
		});	



		this.graph.edges.forEach(function(edge, index){

			edge.update();

		});


	}

}