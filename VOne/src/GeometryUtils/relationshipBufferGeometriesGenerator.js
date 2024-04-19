/**
* Generates line buffered geometries from a provided data model. 
* @class VOne.RelationshipBufferGeometriesGenerator
* @constructor VOne.RelationshipBufferGeometriesGenerator
**/
VOne.RelationshipBufferGeometriesGenerator = function(){

	this.generator = { };


	this.generator.generateFromModel = function(){


		if(!this.model){

			throw new Error('A model is required to generate a points geometry. Use setModel(model) to set one.');
			return -1;

		}

		var bufferGeometryModel = new VOne.BufferGeometryModel(this.model);


		var generated = false;


		var elementsCount = this.model.length;

		var bufferGeometry = new THREE.BufferGeometry();


		var elementsWithParentCount = 0;


		for(var i = 0; i < elementsCount; i++){

			if('parent' in this.model[i]){

				elementsWithParentCount++;

			}

		};


		if(elementsWithParentCount === 0){

			console.error('No element within the provided model has <parent> property.');
			return;

		}


		var positionArray = new Float32Array(elementsWithParentCount * 6);
		var colorArray, alphaArray;


		if(this.setColor){

			colorArray = new Float32Array(elementsWithParentCount * 6);

		}


		if(this.setAlpha){

			alphaArray = new Float32Array(elementsWithParentCount * 2);

		}



		var childElement, parentElement, childElementPosition, parentElementPosition, colors, alphas;



		for(var i = 0; i < elementsCount; i++){

			if('parent' in this.model[i]){

				childElement = this.model[i];
				parentElement = this.model[i].parent;

				childElementPosition = this.model[i].position.clone();
				parentElementPosition = this.model[i].parent.position.clone();

				positionArray[i * 6] = childElementPosition.x;
				positionArray[i * 6 + 1] = childElementPosition.y;
				positionArray[i * 6 + 2] = childElementPosition.z;

				positionArray[i * 6 + 3] = parentElementPosition.x;
				positionArray[i * 6 + 4] = parentElementPosition.y;
				positionArray[i * 6 + 5] = parentElementPosition.z;

				childElement.relationshipsFirstIndex = i * 6;
				parentElement.relationshipsFirstIndex = i * 6 + 3;



				if(this.setColor){

					if(typeof this.setColor === 'function'){

						colors = this.setColor(childElement);
						
						colorArray[i * 6] = colors[0].r;
						colorArray[i * 6 + 1] = colors[0].g;
						colorArray[i * 6 + 2] = colors[0].b;

						colorArray[i * 6 + 3] = colors[1].r;
						colorArray[i * 6 + 4] = colors[1].g;
						colorArray[i * 6 + 5] = colors[1].b;

					} else {

						colorArray[i * 6] = this.setColor[0].r;
						colorArray[i * 6 + 1] = this.setColor[0].g;
						colorArray[i * 6 + 2] = this.setColor[0].b;

						colorArray[i * 6 + 3] = this.setColor[1].r;
						colorArray[i * 6 + 4] = this.setColor[1].g;
						colorArray[i * 6 + 5] = this.setColor[1].b;

					}

				}


				if(this.setAlpha){

					if(typeof this.setAlpha === 'function'){

						alphas = this.setAlpha(childElement);

						alphaArray[i * 2] = alphas[0];
						alphaArray[i * 2 + 1] = alphas[1];

					} else {

						alphaArray[i * 2] = this.setAlpha[0];
						alphaArray[i * 2 + 1] = this.setAlpha[1];

					}

				}

			}

		};


		bufferGeometryModel.setPositionArray(positionArray);

		bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));



		if(this.setColor){

			bufferGeometryModel.setColorArray(colorArray);
			bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));

		}


		if(this.setAlpha){

			bufferGeometryModel.setAlphaArray(alphaArray);
			bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphaArray, 1));

		}


		bufferGeometryModel.setGeometry(bufferGeometry);


		return bufferGeometryModel;

	}

}



VOne.RelationshipBufferGeometriesGenerator.prototype = {

	constructor: VOne.RelationshipBufferGeometriesGenerator,

	/**
	* Sets the model to work with.
	*
	* @method setDataModel
	* @param {Array} model The model to be set for generating the line geometries.
	**/
	setDataModel: function(model){

		this.generator.model = model;
		return this;

	},



	/**
	* Sets a function or default value for setting each line vertex color.
	*
	* @method setColor
	* @param {function || [THREE.Color, THREE.Color]} f The method to set the color for each model's element. Must return an array with two THREE.Color objects, the first one for the child vertex and the second for the parent vertex.
	**/
	setColor: function(f){

		this.generator.setColor = f;
		return this;

	},


	/**
	* Sets a function or default value to set the alpha value for each model's element.
	*
	* @method setAlpha
	* @param {function || [float, float]} f The method to set the alpha for each model's element. Must return an array with two float values, the first one for the child element vertex alpha, the second for the element's parent vertex alpha.
	**/
	setAlpha: function(f){

		this.generator.setAlpha = f;
		return this;

	},


	/**
	* Generates the geometry using the methods provided to set the model and color properties. The model' elements must have a <parent> property pointing to another element in the model. Elements without parent property are ignored.
	*
	* @method generate
	* @return {THREE.BufferGeometry} A THREE.BufferGeometry with the properties provided.
	**/
	generate: function(){

		return this.generator.generateFromModel();

	},

};

