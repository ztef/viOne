/**
* Generates buffered geometries from a provided data model.
* @class VOne.GenericBufferGeometriesGenerator
* @constructor VOne.GenericBufferGeometriesGenerator
* @param {boolean} instancedBufferGeometry Determines if an instanced bufferGeometry will be used.
**/
VOne.GenericBufferGeometriesGenerator = function(instancedBufferGeometry){

	this.generator = { };

	this.generator.generateFromModel = function(){

		if(!this.model){

			throw new Error('A model is required to generate a points geometry. Use setModel(model) to set one.');
			return -1;

		}


		var generated = false;

		var bufferGeometryModel = instancedBufferGeometry ? new VOne.InstancedBufferGeometryModel(this.model) : new VOne.BufferGeometryModel(this.model) ;

		var elementsCount = this.model.length;

		var bufferGeometry = new THREE.BufferGeometry();


		if(typeof this.setPosition !== 'undefined'){

			var positionArray = new Float32Array(elementsCount * 3);

			var position;


			if(typeof this.setPosition === 'function'){

				for(var i = 0; i < elementsCount; i++){

					position = this.setPosition(this.model[i], i);

					this.model[i].position = position;

					positionArray[i * 3] = position.x;
					positionArray[i * 3 + 1] = position.y;
					positionArray[i * 3 + 2] = position.z;

				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					position = this.setPosition;

					this.model[i].position = position;

					positionArray[i * 3] = position.x;
					positionArray[i * 3 + 1] = position.y;
					positionArray[i * 3 + 2] = position.z;

				}

			}

			bufferGeometryModel.setPositionArray(positionArray);

			bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));

			generated = true;

		}


		if(typeof this.setColor !== 'undefined'){

			var colorArray = new Float32Array(elementsCount * 3);

			var color;


			if(typeof this.setColor === 'function'){

				for(var i = 0; i < elementsCount; i++){

					color = this.setColor(this.model[i]), i;

					this.model[i].color = color;

					colorArray[i * 3] = color.r;
					colorArray[i * 3 + 1] = color.g;
					colorArray[i * 3 + 2] = color.b;

				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					color = this.setColor;

					this.model[i].color = color;

					colorArray[i * 3] = color.r;
					colorArray[i * 3 + 1] = color.g;
					colorArray[i * 3 + 2] = color.b;

				}

			}

			bufferGeometryModel.setColorArray(colorArray);

			bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));

			generated = true;

		}



		if(typeof this.setSize !== 'undefined'){


			var sizeArray = new Float32Array(elementsCount);

			var size;


			if(typeof this.setSize === 'function'){

				for(var i = 0; i < elementsCount; i++){

					size = this.setSize(this.model[i], i);

					this.model[i].size = size;

					sizeArray[i] = size;
					
				}

			} else {

				for(var i = 0; i < elementsCount; i++){

					size = this.setSize;

					this.model[i].size = size;

					sizeArray[i] = size;

				}

			}

			bufferGeometryModel.setSizeArray(sizeArray);

			bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

			generated = true;

		}



		if(typeof this.setAlpha !== 'undefined'){


			var alphaArray = new Float32Array(elementsCount);

			var alpha;


			if(typeof this.setAlpha === 'function'){

				for(var i = 0; i < this.model.length; i++){

					alpha = this.setAlpha(this.model[i], i);

					this.model[i].alpha = alpha;

					alphaArray[i] = alpha;

				}

			} else {

				for(var i = 0; i < this.model.length; i++){

					alpha = this.setAlpha;

					this.model[i].alpha = alpha;

					alphaArray[i] = alpha;

				}

			}

			bufferGeometryModel.setAlphaArray(alphaArray);

			bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphaArray, 1));

			generated = true;

		}


		if(!generated){
			console.error('no geometry generated. Try setting position, color, size or alpha first.');
			return -1;
		}


		bufferGeometryModel.setGeometry(bufferGeometry);

		return bufferGeometryModel;


	}

};



VOne.GenericBufferGeometriesGenerator.prototype = {
	 
	constructor: VOne.GenericBufferGeometriesGenerator,

	/**
	* Sets the model to work with.
	*
	* @method setModel
	* @param {Array} model The model to be set.
	**/
	setModel: function(model){

		this.generator.model = model;
		return this;

	},

	/**
	* Sets a function or default value to set position for each model's element.
	*
	* @method setPosition
	* @param {function || THREE.Vector3} f The method to set position for each model's element. Must return a THREE.Vector3 object.
	**/
	setPosition: function(f){

		this.generator.setPosition = f;
		return this;

	},

	/**
	* Sets a function or default value to set color for each model's element.
	*
	* @method setColor
	* @param {function || THREE.Color} f The method to set the color for each model's element. Must return a THREE.Color object.
	**/
	setColor: function(f){

		this.generator.setColor = f;
		return this;

	},

	/**
	* Sets a function or default value to set the size for each model's element.
	*
	* @method setSize
	* @param {function || float} f The method to set the size for each model's element. Must return a float value.
	**/
	setSize: function(f){

		this.generator.setSize = f;
		return this;

	},

	/**
	* Sets a function or default value to set the alpha value for each model's element.
	*
	* @method setAlpha
	* @param {function || float} f The method to set the alpha for each model's element. Must return a float value.
	**/
	setAlpha: function(f){

		this.generator.setAlpha = f;
		return this;

	},

	/**
	* Generates the buffer geometry using the methods provided to set the geometry properties.
	*
	* @method generate
	* @return {VOne.BufferGeometryModel} A VOne.BufferGeometryModel with the properties provided set.
	**/
	generate: function(){

		return this.generator.generateFromModel();

	}

};