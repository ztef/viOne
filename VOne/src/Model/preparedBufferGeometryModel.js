/**
* Represents a BufferGeometry with its dataModel and attributes. Can handle partial rendering of the buffer geometry attributes.
* @class VOne.PreparedBufferGeometryModel
* @constructor VOne.PreparedBufferGeometryModel
* @extends VOne.BufferGeometryModel
* @param {int} maxVerticesNumber The max vertices amount that the geometry will handle. Values like NaN of Infinity can lead to disaster. Please use natural numbers.
* @param {Array} dataModel The dataModel objects array.
**/
VOne.PreparedBufferGeometryModel = function(maxVerticesNumber, dataModel){

	if(!maxVerticesNumber || 'number' !== typeof maxVerticesNumber)
		return new Error('Usage: new PreparedBufferGeometryModel(maxVerticesNumber, [dataModel]);');


	VOne.BufferGeometryModel.call(this, dataModel);


	this.type = 'PreparedBufferGeometryModel';

	/**
	* Max number of vertices that the BufferGeometry will be able to manage.
	* @property maxVerticesNumber
	* @type int
	**/
	this.maxVerticesNumber = maxVerticesNumber;



	/**
	* Function/value to be executed/applied for setting position values for the corresponding model element vertex.
	*
	* @property setPositionFor
	* @type function | THREE.Vector3
	**/
	this.setPositionFor = undefined;


	/**
	* Function/value to be executed/applied for setting color values for the corresponding model element vertex.
	*
	* @property setColorFor
	* @type function | THREE.Color
	**/
	this.setColorFor = undefined;


	/**
	* Function/value to be executed/applied for setting size value for the corresponding model element vertex.
	*
	* @property setSizeFor
	* @type function | float
	**/
	this.setSizeFor = undefined;


	/**
	* Function/value to be executed/applied for setting alpha value for the corresponding model element vertex.
	*
	* @property setAlphaFor
	* @type function | float
	**/
	this.setAlphaFor = undefined;


	this.setGeometry(new THREE.BufferGeometry());


};



VOne.PreparedBufferGeometryModel.prototype = Object.create(VOne.BufferGeometryModel.prototype);

VOne.PreparedBufferGeometryModel.prototype.constructor = VOne.PreparedBufferGeometryModel;


/**
* Sets a function or default value to set position for each model's element.
*
* @method setPosition
* @param {function || THREE.Vector3} f The method to set position for each model's element. Must return a THREE.Vector3 object.
**/
VOne.PreparedBufferGeometryModel.prototype.setPosition = function(f){

	this.setPositionFor = f;

	if(this.positionArray === undefined){

		this.positionArray = new Float32Array(this.maxVerticesNumber * 3);
		this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positionArray, 3));

	}

	return this;

};


/**
* Sets a function or default value to set the size for each model's element.
*
* @method setSize
* @param {function || float} f The method to set the size for each model's element. Must return a float value.
**/
VOne.PreparedBufferGeometryModel.prototype.setSize = function(f){

	this.setSizeFor = f;

	if(this.sizeArray === undefined){

		this.sizeArray = new Float32Array(this.maxVerticesNumber);
		this.geometry.addAttribute('size', new THREE.BufferAttribute(this.sizeArray, 1));

	}

	return this;

};


/**
* Sets a function or default value to set color for each model's element.
*
* @method setColor
* @param {function || THREE.Color} f The method to set the color for each model's element. Must return a THREE.Color object.
**/
VOne.PreparedBufferGeometryModel.prototype.setColor = function(f){

	this.setColorFor = f;

	if(this.colorArray === undefined){

		this.colorArray = new Float32Array(this.maxVerticesNumber * 3);
		this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));

	}

	return this;

};


/**
* Sets a function or default value to set the alpha value for each model's element.
*
* @method setAlpha
* @param {function || float} f The method to set the alpha for each model's element. Must return a float value.
**/
VOne.PreparedBufferGeometryModel.prototype.setAlpha = function(f){

	this.setAlphaFor = f;

	if(this.alphaArray === undefined){

		this.alphaArray = new Float32Array(this.maxVerticesNumber);
		this.geometry.addAttribute('alpha', new THREE.BufferAttribute(this.alphaArray, 1));

	}

	return this;

};


/**
* Sets the model to work with.
*
* @method setDataModel
* @param {Array} model The model to be set.
**/
VOne.PreparedBufferGeometryModel.prototype.setDataModel = function(model){

	if(model.length > this.maxVerticesNumber){

		console.warn('Providing a model larger than the max vertices number assigned can lead to unexpected and fatal behaviour.');

	}

	this.dataModel = model;

	return this;

};





/**
* Appends new records to the data model.
*
* @method appendRecords
* @param {Array} Records to be appended to the dataModel.
* @param {Boolean} processRecordsAfterAppend If set to true, the records will be processed using the provided methods for setting their position, color, size and/or alpha and the geometry will be updated.
**/
VOne.PreparedBufferGeometryModel.prototype.appendRecords = function(records, processAfterAppending){

	var willProcess = processAfterAppending || false;

	var previousOffset = this.dataModel.length;
	var newOffset = previousOffset + records.length;

	this.dataModel.extend(records);

	if(willProcess){

		this.processRecords(previousOffset, records.length);

	}

	return { previusModelSize: previousOffset, currentModelSize: newOffset };

};


/**
* Process the records in the data model by evaluating on each one the functions provided for setting position, size, color and/or alpha and updates the geometry with the results.
*
* @method processRecords
* @param {int} offset Starting record to process..
* @param {int} count The number of records to be processed starting from the provided offset.
**/
VOne.PreparedBufferGeometryModel.prototype.processRecords = function(offset, count){

	var startingRecord = offset || 0;
	var recordsToUpdate = count || this.dataModel.length;

	var endingRecord = recordsToUpdate + startingRecord;

	if(endingRecord > this.dataModel.length){

		endingRecord = this.dataModel.length - 1;

	}

	var record;

	for(var i = startingRecord; i < endingRecord; i++){

		record = this.dataModel[i];

		if(this.setPositionFor !== undefined){

			if('function' === typeof this.setPositionFor){

				record.position = this.setPositionFor(record, i);

			} else {

				record.position = this.setPositionFor;

			}

			this.positionArray[i * 3] = record.position.x;
			this.positionArray[i * 3 + 1] = record.position.y;
			this.positionArray[i * 3 + 2] = record.position.z;

		}


		if(this.setColorFor !== undefined){

			if('function' === typeof this.setColorFor){

				record.color = this.setColorFor(record, i);

			} else {

				record.color = this.setColorFor;

			}

			this.colorArray[i * 3] = record.color.r;
			this.colorArray[i * 3 + 1] = record.color.g;
			this.colorArray[i * 3 + 2] = record.color.b;

		}



		if(this.setSizeFor !== undefined){

			if('function' === typeof this.setSizeFor){

				record.size = this.setSizeFor(record, i);

			} else {

				record.size = this.setSizeFor;

			}

			this.sizeArray[i] = record.size;

		}



		if(this.setAlphaFor !== undefined){

			if('function' === typeof this.setAlphaFor){

				record.alpha = this.setAlphaFor(record, i);

			} else {

				record.alpha = this.setAlphaFor;

			}

			this.alphaArray[i] = record.alpha;

		}


	}



	if(this.setPositionFor !== undefined){

		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.computeBoundingSphere();

	}



	if(this.setColorFor !== undefined){

		this.geometry.attributes.color.needsUpdate = true;

	}



	if(this.setSizeFor !== undefined){

		this.geometry.attributes.size.needsUpdate = true;

	}



	if(this.setAlphaFor !== undefined){

		this.geometry.attributes.alpha.needsUpdate = true;

	}



	this.geometry.drawRange.count = this.dataModel.length;

};


/**
* Sets the number of records / vertices to be rendered.
*
* @method setGeometryDrawRangeCount
* @param {int} count Number of vertices to render.
**/
VOne.PreparedBufferGeometryModel.prototype.setGeometryDrawRangeCount = function(count){

	this.geometry.drawRange.count = count;

};
