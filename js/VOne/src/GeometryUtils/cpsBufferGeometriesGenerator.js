/**
* Generates buffered geometries with color, position and size attributes from a provided data model.
* @class VOne.CPSBufferGeometriesGenerator
* @constructor VOne.CPSBufferGeometriesGenerator
**/
VOne.CPSBufferGeometriesGenerator = function(){


	var geometriesGenerator = { };


	/**
	* Generates the geometries from the provided model and atach them to the scene.
	*
	* @method generateGeometries
	*
	* @param {Object} config Config object
	* @param {boolean} config.interactive Indicates if the generated geometries will be interactive.
	* @param {boolean} config.hasRelations Indicates if elements will have relations with their corresponding parent.
	* @param {Function} config.elementZPos Function that will be processed to determine the z position for each element. Must return a Float number. By default returns a random number between 0 and 1000
	* @ @param {Function} config.elementSize A function that must return the size for the element. By default returns 250.
	* @param {Function} config.elementColor A method used to determine the element's color. By default returns 'pink'.
	* @param {Float} config.elementAlpha Elements alpha. Must have a value between 0 and 1.
	* @param {String} config.texturePath Path to an image to be used as texture for elements.
	* @param {Function} [config.relationsLinesColor] A function that must return an array with 2 values for collor for the corresponding relation lines. The first element of the array is equivalent to the elements vertex, the second one the color for the parent element vertex.
	* @param {Number} [config.relationsLineWidth] Line width for relations. Default is 0.5
	* @param {Number} [config.relationsLinesAlpha] Alpha for relations lines. Default is 0.9
	* @param {VOne.SceneManager} scene The scene to attach the generated Points geometry.
	* @param {Array} model An array containing model data.
	* @param {String} [name] The name for the generated geometry.
	*
	* @return {VOne.GeometryModel} The VOne.GeometryModel corresponding to the provided model.
	**/
	geometriesGenerator.generateGeometries = function(config, scene, model, name) {


		var interactive = config.interactive || 'false';

		var _dataModel = model;

		var hasRelations = config.hasRelations || false;

		var elementZPos = config.elementZPos || function(d){ return Math.random() * 1000; };

		var elementSize = config.elementSize ? ( typeof config.elementSize === 'function' ? config.elementSize : function(d){ return config.elementSize; } ) : function(d) { return 250; };

		var elementColor = config.elementColor ? ( typeof config.elementColor === 'function' ? config.elementColor : function(d){ return config.elementColor; } ) : function(d) { return 'pink';  };


		var elementAlpha = config.elementAlpha ?  config.elementAlpha  : .9;


		var relationsLinesColor;

		var relationsLineWidth;

		var relationsLinesAlpha;


		var relationsLines; 



		if(typeof _dataModel === 'undefined'){

			console.error('ERROR: A data model is required.');

			return;

		}


		if(hasRelations){

			relationsLines = new Float32Array(_dataModel.length * 6);

			relationsLinesColor = config.relationsLinesColor ? ( typeof config.relationsColor === 'function' ? config.relationsColor : function(d){ return config.relationsColor; }) : function(d) { return [ 0x777777, 0x777777 ]; };

			relationsLineWidth = config.relationsLineWidth || 0.5;

			relationsLinesAlpha = config.relationsLinesAlpha ? config.relationsLinesAlpha : 1;

		} 
		


		var positions = new Float32Array(_dataModel.length * 3);
		var sizes = new Float32Array(_dataModel.length);
		var colors = new Float32Array(_dataModel.length * 3);


		var bufferGeometry = new THREE.BufferGeometry();

		var relationsBufferGeometry;



		_dataModel.forEach(function(element, index){

			positions[index * 3] = element.position.x;
			positions[index * 3 + 1] = element.position.y;

			element.position.z = element.position.z || elementZPos(element);

			positions[index * 3 + 2] = !isNaN(element.position.z) ? element.position.z : 0;


			sizes[index] = elementSize(element);


			element.size = sizes[index];


			var color = new THREE.Color(elementColor(element));


			colors[index * 3] = color.r;
			colors[index * 3 + 1] = color.g;
			colors[index * 3 + 3] = color.b;


			element.color = color;


			if(hasRelations && element.parent){


				relationsLines[index * 6] = element.position.x;
				relationsLines[index * 6 + 1] = element.position.y;
				relationsLines[index * 6 + 2] = element.position.z;

				relationsLines[index * 6 + 3] = element.parent.position.x;
				relationsLines[index * 6 + 4] = element.parent.position.y;

				if(!element.parent.position.z) element.parent.position.z = elementZPos(element.parent);

				relationsLines[index * 6 + 5] = element.parent.position.z;

			}


		});


		
		var texture;


		var textureLoader = new THREE.TextureLoader();

			

		if(!config.texturePath){


			texture = textureLoader.load(VOne.DefaultImages.star);


		} else {

			texture = textureLoader.load(config.texturePath);
			
		}


		var bufferGeometryUniforms = {


			uniformsColor: { type: "c", value: new THREE.Color( 0xffffff ) },
			texture: { type: "t", value: texture }
			
		}; 




		var bufferGeometryMaterial = new THREE.ShaderMaterial({

			uniforms: bufferGeometryUniforms, 
			vertexShader: VOne.Shaders.nodesCPS.vertex,
			fragmentShader: VOne.Shaders.nodesCPS.fragment,

			blending: THREE.AdditiveBlending,
			depthTest: true,

			transparent: elementAlpha < 1 ? true : false,
			opacity: elementAlpha


		});



		bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
		bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));



		var nodesPointCloud = new THREE.Points(bufferGeometry, bufferGeometryMaterial);


		nodesPointCloud.name = name + 'Nodes';


		scene.add(nodesPointCloud, nodesPointCloud.name);



		if(hasRelations){


			relationsBufferGeometry = new THREE.BufferGeometry();

			relationsBufferGeometry.addAttribute('position', new THREE.BufferAttribute(relationsLines, 3));

			var relationsMeshes = new THREE.Line( relationsBufferGeometry, new THREE.LineBasicMaterial( { lineWidth: relationsLineWidth, color: relationsLinesColor[0], transparent: true, opacity: relationsLinesAlpha }));


			relationsMeshes.name = name + 'Relations';

			scene.add(relationsMeshes, relationsMeshes.name);


		}


		var geometryModel = new VOne.GeometryModel(name, nodesPointCloud, _dataModel, bufferGeometry.attributes);


		return geometryModel;


	};
	


	var setPosition = function(position, animate){


		var _animate = animate || false;


		if(_animate){
		
			if(position.x)
				this.targetPosition.x = position.x;
	
			if(position.y)
				this.targetPosition.y = position.y;
	
			if(position.z)
				this.targetPosition.z = position.z;
		
		}


	}




	return geometriesGenerator;


}