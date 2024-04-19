VOne.GraphGeometriesGenerator = function(graph, textureMap){


	this.type = 'VOne.GeometriesGenerator';


	if(!graph){

		console.error('You must provide a VOne.graph.');

		return -1;

	}

	this.graph = graph;

	this.textureMap = textureMap || { default: { color: 'pink', scale: 10 } };


	this.geometries = [ ];

	this.relationsBufferGeometry = new THREE.BufferGeometry();

	this.relations = new Float32Array(graph.edges.length * 3);

	this.lineMaterial = new THREE.LineBasicMaterial( { linewidth: 0.1, color: 0xffffff, transparent: true, opacity: 0.8 } );

};



VOne.GraphGeometriesGenerator.prototype = {

	constructor: VOne.GraphGeometriesGenerator

}



VOne.GraphGeometriesGenerator.prototype.buildGeometries = function(argument){
	 

	var textures = { };

	var textureMap = this.textureMap;

	var textureLoader = new THREE.TextureLoader();

	var geometriesGenerator = this;


	var mapKeys = Object.keys(textureMap);



	mapKeys.forEach(function(key){

		var map;


		if(key.texturePath)
			map = textureLoader.load(textureMap[key].texturePath);

		else
			map = textureLoader.load(VOne.DefaultImages.star);



		var color = new THREE.Color(textureMap[key].color);


		textureMap[key].material = new THREE.SpriteMaterial( { map: map, color: color } );

	});




	this.graph.nodes.forEach(function(node){


		var nodeType = typeof node.type === 'undefined' ? 'default' : node.type;

		var sprite = new THREE.Sprite(textureMap[nodeType].material);

		sprite.position = node.position;

		sprite.scale.x = sprite.scale.y = sprite.scale.z = textureMap[nodeType].scale;

		node.sprite = sprite;


		node.update = function(){

			var position = node.position.clone();
			sprite.position.set(position.x, position.y, position.z);

		}


		geometriesGenerator.geometries.push(sprite);
		

	});



	this.graph.edges.forEach(function(edge, index){

		
		edge.update = function() {

			var sourcePosition = edge.from.position.clone();
			var targetPosition = edge.to.position.clone();

			geometriesGenerator.relations[index * 6] = sourcePosition.x;
			geometriesGenerator.relations[index * 6 + 1] = sourcePosition.y;
			geometriesGenerator.relations[index * 6 + 2] = sourcePosition.z;

			geometriesGenerator.relations[index * 6 + 3] = targetPosition.x;
			geometriesGenerator.relations[index * 6 + 4] = targetPosition.y;
			geometriesGenerator.relations[index * 6 + 5] = targetPosition.z;

			if(geometriesGenerator.relationsBufferGeometry.attributes.position)
				geometriesGenerator.relationsBufferGeometry.attributes.position.needsUpdate = true;

		}


		edge.update();


	});





	geometriesGenerator.relationsBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute (geometriesGenerator.relations, 3 ) );

	var lines = new THREE.LineSegments ( geometriesGenerator.relationsBufferGeometry, geometriesGenerator.lineMaterial);


	return { nodes: this.geometries, relations: lines };


};