/**
* A directed graph model edge.
*
*
* @class VOne.GraphEdge
* @constructor VOne.GraphEdge
*
**/
VOne.GraphEdge = function(origin, target){

	this.from = origin;
	this.to = target;
	// this.relationship = relationship;
	// this.displayList = {};
	// this.subGraphs = {};
	// this.planes = [];

}


VOne.GraphEdge.prototype = {

	constructor: VOne.GraphEdge,


	getVector : function(){

		var vector = this.to.position.clone();
		vector.sub(this.from.position);
		return vector;

	},



	initNodePositions : function(startingPosition){

		if (this.to.atOrigin() && !this.from.atOrigin()){

			this.to.position.set(Math.random() + this.from.position.x,
								Math.random() + this.from.position.y,
								Math.random() + this.from.position.z);

		} else if (this.from.atOrigin() && !this.to.atOrigin()){

			this.from.position.set(Math.random() + this.to.position.x,
								Math.random() + this.to.position.y,
								Math.random() + this.to.position.z);

		} else if (startingPosition) {

			this.from.position.set(startingPosition.x, startingPosition.y, startingPosition.z);
			this.to.position.set(startingPosition.x, startingPosition.y, startingPosition.z)

		}

		this.graph.changed = true;

	},


	update: function(){


	}

};
