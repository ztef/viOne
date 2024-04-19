VOne.GraphBuilder = function(data, map){

	this.data = data;

	this.map = map || { };

}



VOne.GraphBuilder.prototype = {

	constructor: VOne.GraphBuilder,



	buildGraph: function() {

		var graph = new VOne.Graph();

		var idProperty = 'id';
		var targetIdProperty = 'id';

		if (this.map.id)
			idProperty = this.map.id;


		if (this.map.targetId)
			targetIdProperty = this.map.targetId;


		//Build nodes structure

		var nodeId;

		this.data.forEach(function(record, index){


			nodeId = record[idProperty];

			var node = new VOne.GraphNode(nodeId, graph);

			graph.addNode(node);


		});




		// Building relations

		this.data.forEach(function(record, index){

			var sourceNodeId = record[idProperty];


			record.friends.forEach(function(target, index){


				var targetNodeId = target[targetIdProperty];


				var sourceNode = graph.getNodeById(sourceNodeId);
				var targetNode = graph.getNodeById(targetNodeId);

				var edge = new VOne.GraphEdge(sourceNode, targetNode);

				graph.addEdge(edge);

			});

		});


		return graph;

	}

}
