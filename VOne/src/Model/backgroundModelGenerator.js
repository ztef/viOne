/**
* <p>A tool for creating data models with raw data types and generate position, color, size and alpha arrays to be used with a THREE.BufferGeometry.</p><p>The data model can be created from several records arrays. This is useful when working with partial data loads and/or large data sets.</p><p>Processing position, color, alpha and size setting functions and appending records to the data model is done in a separate background thread. Therefore the class name.</p>
* @class VOne.BackgroundModelGenerator
* @constructor VOne.BackgroundModelGenerator
* @extends VOne.PreparedBufferGeometryModel
* @param {int} recordsCount <p>The total records to be expected to manage. </p><p>This parameter will reserve the exact memory ammount to handle those records, no more. So, if you set this param to be smaller than your final recordset, you'll be troubled.</p>
* @param {Object} model <p>The properties model that each record will have and you'll need to use.</p><p>This param must have the following format: </p><p>&nbsp; &nbsp; { propertyName: array_type, propertyName: array_type ... propertyName: array_type } </p><p>where propertyName is the property name to use from each record and array type is one of the following list: </p><p><ul><li>Int8Array</li><li>Uint8Array</li><li>Uint8ClampedArray</li><li>Int16Array</li><li>Uint16Array</li><li>Int32Array</li><li>Uint32Array</li><li>Float32Array</li><li>Float64Array</li></ul></p><p>Each one of these array types must correspond to the type of the value expected for each field/property from the recordset. For more information about each one of these array types visit <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray">Typed arrays docs</a> </p>
* @param {int} recordsPartialDeliverCount Indicates the amount of records that will be passed to the background thread each time when working with multiple partial records loading. If not set, the recordsCount value will be used.
**/
VOne.BackgroundModelGenerator = function(recordsCount, model, recordsPartialDeliverCount){

	if(!recordsCount || !model){

		console.error('Must provide a valid records count value and a model to initialize! ej.:\n var mySuperModelGenerator = new VOne.BackgroundModelGenerator(howManyRecordsToHandle, { propertyName: \'property_type\', propertyName: \'property_type\' } );\n Check VOne documentation about valid property\'s types');

		return -1;

	}

	var that = this;


	this.maskedDataModel = [ ];

	this.modelKeys = Object.keys(model);

	this.rawData =  { };


	/**
	* Data model to be used with a THREE.BufferGeometry object. Updated each time that records are added via processRecords method.
	* @property dataModel
	* @type Proxy
	**/
	this.dataModel = undefined;


	VOne.PreparedBufferGeometryModel.call(this, recordsCount, this.dataModel);


	this.type = 'BackgroundModelGenerator';


	/**
	* Max number of records to manage.
	* @property recordsCount
	* @type int
	**/
	this.recordsCount = recordsCount;


	/**
	* Amount of records to send to the thread to process in case of two or more partial record loads.
	*
	* @property recordsPartialDeliverCount
	* @type int
	*/
	this.recordsPartialDeliverCount = recordsPartialDeliverCount || recordsCount;

	this.partialDeliver3Times = this.recordsPartialDeliverCount * 3;


	/**
	* The background thread program. Ideally you won't need to interact with or modify it.
	* @property worker
	* @type Worker
	**/
	this.worker = undefined;


	/**
	* String containing the script that should be used to set positions for each record. This is set via setPositionScript. This property has been exposed in case you need to set other than default behaviour for setting positions.
	* @property positionsProgram
	* @type String
	**/
	this.positionsProgram = undefined;


	/**
	* String containing the script that should be used to set color properties for each record. This is set via setColorScript. This property has been exposed in case you need to set other than default behaviour for setting colors.
	* @property colorsProgram
	* @type String
	**/
	this.colorsProgram = undefined;


	/**
	* String containing the script that should be used to set size properties for each record. This is set via setSizeScript. This property has been exposed in case you need to set other than default behaviour for setting sizes.
	* @property sizesProgram
	* @type String
	**/
	this.sizesProgram = undefined;


	/**
	* String containing the script that should be used to set alpha properties for each record. This is set via setAlphaScript. This property has been exposed in case you need to set other than default behaviour for setting alpha.
	* @property alphasProgram
	* @type String
	**/
	this.alphasProgram = undefined;




	this.modelKeys.forEach(function(key){

		switch(model[key]){

			case 'Int8Array':
				that.rawData[key] = new Int8Array(recordsCount);
				break;

			case 'Uint8Array':
				that.rawData[key] = new Uint8Array(recordsCount);
				break;

			case 'Uint8ClampedArray':
				that.rawData[key] = new Uint8ClampedArray(recordsCount);
				break;

			case 'Int16Array':
				that.rawData[key] = new Int16Array(recordsCount);
				break;

			case 'Uint16Array':
				that.rawData[key] = new Uint16Array(recordsCount);
				break;


			case 'Int32Array':
				that.rawData[key] = new Int32Array(recordsCount);
				break;

			case 'Uint32Array':
				that.rawData[key] = new Uint32Array(recordsCount);
				break;


			case 'Float32Array':
				that.rawData[key] = new Float32Array(recordsCount);
				break;

			case 'Float64Array':
				that.rawData[key] = new Float64Array(recordsCount);
				break;

		}


	});


	this.program = [

		"var model = { }, recordsPartialDeliverCount = " + this.recordsPartialDeliverCount + ';',

		"var dataModel_;",

		"var extras;",

		"var recordsCount_;",

		"function initModel(dataModel, recordsCount){",

			"dataModel_ = dataModel;",

			"var keys = Object.keys(dataModel);",

			"recordsCount_ = recordsCount;",

			"keys.forEach(function(key){",

				"switch(dataModel[key]){",

					"case 'Int8Array':",
						"model[key] = new Int8Array(recordsCount);",
						"break;",

					"case 'Uint8Array':",
						"model[key] = new Uint8Array(recordsCount);",
						"break;",

					"case 'Uint8ClampedArray':",
						"model[key] = new Uint8ClampedArray(recordsCount);",
						"break;",

					"case 'Int16Array':",
						"model[key] = new Int16Array(recordsCount);",
						"break;",

					"case 'Uint16Array':",
						"model[key] = new Uint16Array(recordsCount);",
						"break;",


					"case 'Int32Array':",
						"model[key] = new Int32Array(recordsCount);",
						"break;",

					"case 'Uint32Array':",
						"model[key] = new Uint32Array(recordsCount);",
						"break;",


					"case 'Float32Array':",
						"model[key] = new Float32Array(recordsCount);",
						"break;",

					"case 'Float64Array':",
						"model[key] = new Float64Array(recordsCount);",
						"break;",


					"default:",
						"if(dataModel[key].toLowerCase().indexOf('string') > -1){",
							"var lengthStartPos = dataModel[key].indexOf('(');",
							"var lengthEndPos = dataModel[key].indexOf(')');",
							"var strMaxLength = parseInt(dataModel[key].substr(lengthStartPos + 1, lengthEndPos - lengthStartPos - 1));",
							"model[key] = new Uint8Array(recordsCount * strMaxLength);",
						"}",
						"break;",

				"}",

			"});",

			"self.postMessage(model);",

		"};",

		"function stringToTypedArray(s) {",
		    "var escstr = encodeURIComponent(s);",
		    "var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {",
		        "return String.fromCharCode('0x' + p1);",
		    "});",
		    "var ua = new Uint8Array(binstr.length);",
		    "Array.prototype.forEach.call(binstr, function (ch, i) {",
		        "ua[i] = ch.charCodeAt(0);",
		    "});",
		    "return ua;",
		"}",

	];


	this.messengerProgramHead = [

		"self.onmessage = function(e){",

			"var data = e.data;",
			"switch(data.cmd){",


				"case 'initModel':",
					"initModel(data.dataModel, data.recordsCount);",
					"break;",

				"case 'processRecords':",
					"processRecords(data.records, data.offset);",
					"break;",

				"case 'getRecords':",
					"self.postMessage({ messageType: 'model', content: model });",
					"break;",

				"case 'setExtras':",
					"extras = data.extras;",
					"break;"

	];


	this.messengerProgramBody = [ ];


	this.messengerProgramTail = [

				"default:",
					"self.postMessage('Unrecognized command or command not yet implemented. sorry... =(');",
					"break;",

			"}",

		"}"


	];



	this.recordsCount3Times = this.recordsCount * 3;

	this.dataModelForWorker = model;

	this.drawRangeCurrentIndex = 0;


};


VOne.BackgroundModelGenerator.prototype = Object.create(VOne.PreparedBufferGeometryModel.prototype);


VOne.BackgroundModelGenerator.prototype.constructor = VOne.BackgroundModelGenerator;


/**
* Sets a function implementation which will assign a position for each dataset element.
*
* @method setPositionScript
* @param {String} positionScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an object with x, y and z properties. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setPositionScript("return { x: Math.random(), y: record.amount * 13, z: index * 666 } "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setPositionScript = function(positionProgram){

	this.positionsProgram = [ ];

	this.program.push('var positionArray = new Float32Array(' + this.partialDeliver3Times + '); var positionResult;' );

	this.program.push('var setPositionFunction = function(record, index) { ' + positionProgram + ' } ;');


	this.positionsProgram.push('positionResult = setPositionFunction(record, i);');

	this.positionsProgram.push('positionArray[j * 3] = positionResult.x');
	this.positionsProgram.push('positionArray[j * 3 + 1] = positionResult.y');
	this.positionsProgram.push('positionArray[j * 3 + 2] = positionResult.z');

	this.useSetPositionsProgram = true;


	this.messengerProgramBody.push("case 'getPositionArray':",
				"self.postMessage({ messageType: 'positionArray', content: positionArray });",
				"break;");


	this.positionArray = new Float32Array(this.recordsCount3Times);

	this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positionArray, 3));


	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setColorScript
* @param {String} colorScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an object with r, g and b properties where 0 < r, g, b <= 1. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setColorScript("return { r: Math.random(), g: record.amount * 13 / 66, z: index * 0.00666 } "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setColorScript = function(colorProgram){

	this.colorsProgram = [ ];

	this.program.push('var colorArray = new Float32Array(' + this.partialDeliver3Times + '); var colorResult;' );

	this.program.push('var setColorFunction = function(record, index){ ' + colorProgram + ' };');


	this.colorsProgram.push('colorResult = setColorFunction(record, i);');

	this.colorsProgram.push('colorArray[j * 3] = colorResult.r');
	this.colorsProgram.push('colorArray[j * 3 + 1] = colorResult.g');
	this.colorsProgram.push('colorArray[j * 3 + 2] = colorResult.b');


	this.useSetColorsProgram = true;


	this.messengerProgramBody.push("case 'getColorArray':",
				"self.postMessage({ messageType: 'colorArray', content: colorArray });",
				"break;");


	this.colorArray = new Float32Array(this.recordsCount3Times);

	this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));


	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setSizeScript
* @param {String} sizeScript The method to set position for each element on the dataset <string>in a string format</strong>. Must return an float value. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setSizeScript("return record.amount * index * 0.5; "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setSizeScript = function(sizeScript){

	this.sizesProgram = [ ];

	this.program.push('var sizeArray = new Float32Array(' + this.recordsPartialDeliverCount + '); var sizeResult;' );

	this.program.push('var setSizeFunction = function(record, index) { ' + sizeScript + ' };');


	this.sizesProgram.push('sizeResult = setSizeFunction(record, i);');

	this.sizesProgram.push('sizeArray[j] = sizeResult');

	this.useSetSizesProgram = true;


	this.messengerProgramBody.push("case 'getSizeArray':",
				"self.postMessage({ messageType: 'sizeArray', content: sizeArray });",
				"break;");


	this.sizeArray = new Float32Array(this.recordsCount);

	this.geometry.addAttribute('size', new THREE.BufferAttribute(this.sizeArray, 1));

	return this;

};


/**
* Sets a function implementation which will assign a color for each dataset element.
*
* @method setAlphaScript
* @param {String} alphaScript The method to set alpha for each element on the dataset <string>in a string format</strong>. Must return an float value where 0 < value <= 1. The method will receive the record from the dataset and the corresponding index as params. <br/><p>Example</p><p>&#09;myBackgroundModelGenerator.setAlphaScript("return record.amount * index * 0.5; "); </p><p>Because of the nature of threads, global and window variables won't be available in the scope of this function.</p>
**/
VOne.BackgroundModelGenerator.prototype.setAlphaScript = function(alphaScript){

	this.alphasProgram = [ ];

	this.program.push('var alphaArray = new Float32Array(' + this.recordsPartialDeliverCount + '); var alphaResult;' );

	this.program.push('var setAlphaFunction = function(record, index){ ' + alphaScript + ' };');


	this.alphasProgram.push('alphaResult = setAlphaFunction(record, i);');

	this.alphasProgram.push('alphaArray[j] = alphaResult');

	this.useSetAlphasProgram = true;


	this.messengerProgramBody.push("case 'getAlphaArray':",
				"self.postMessage({ messageType: 'alphaArray', content: alphaArray });",
				"break;");


	this.alphaArray = new Float32Array(this.recordsCount);

	this.geometry.addAttribute('alpha', new THREE.BufferAttribute(this.alphaArray, 1));

	return this;

},



/**
* Initializes the background thread with the provided scripts for processing the records and reserves the needed amount of memory for storing all the needed properties and records.
*
* @method init
*
**/
VOne.BackgroundModelGenerator.prototype.init = function() {

	var that = this;

	this.program.push(

		"var processRecords = function(records, offset){",

			"var finalIndex = records.length + offset;",

			"var record;",

			"var currentIndex = 0;",

			"var modelKeys = Object.keys(model);",

			"var j = 0;",

			"var strIndex;",

			"var toStore;",


			"for(var i = offset; i < finalIndex; i++, j++){",


				"record = records[currentIndex];",


				"modelKeys.forEach(function(key){",

					"if(dataModel_[key].toLowerCase().indexOf('string') === -1){",

						"model[key][currentIndex] = record[key];",

					"} else {",

						"strIndex = model[key].length / recordsCount_ * i",
						"toStore = stringToTypedArray(record[key])",

						"toStore.forEach(function (value, index) {",

							"model[key][strIndex + index] = value",

						" } );",

					"}",


				"});"

	);


	if(this.positionsProgram)
		this.program.push(this.positionsProgram.join('\n'));


	if(this.colorsProgram)
		this.program.push(this.colorsProgram.join('\n'));

	if(this.sizesProgram)
		this.program.push(this.sizesProgram.join('\n'));

	if(this.alphasProgram)
		this.program.push(this.alphasProgram.join('\n'));


	this.program.push(

				"currentIndex ++;",

			"}");


			if(this.positionsProgram || this.colorsProgram || this.sizesProgram || this.alphasProgram) {

				var message = [ ];
				var transferrables = [ ];

				var transferrablesCount = 0;

				this.program.push('self.postMessage({ messageType: \'transferrables\', offset: offset, finalIndex: finalIndex, transferrables: {  ');


				if(this.positionsProgram){

					message.push(transferrablesCount > 0 ? ', positionArray: positionArray' : 'positionArray: positionArray');

					transferrables.push( transferrablesCount > 0 ? ', positionArray.buffer' : 'positionArray.buffer');

					transferrablesCount++;

				}


				if(this.colorsProgram){

					message.push( transferrablesCount > 0 ? ', colorArray: colorArray' : 'colorArray: colorArray');

					transferrables.push( transferrablesCount > 0 ? ', colorArray.buffer' : 'colorArray.buffer');

					transferrablesCount++;

				}


				if(this.sizesProgram){

					message.push( transferrablesCount > 0 ? ', sizeArray: sizeArray' : 'sizeArray: sizeArray' );

					transferrables.push( transferrablesCount > 0 ? ', sizeArray.buffer' : 'sizeArray.buffer');

					transferrablesCount++;

				}


				if(this.alphasProgram){

					message.push( transferrablesCount > 0 ? ', alphaArray: alphaArray' : 'alphaArray: alphaArray' );

					transferrables.push ( transferrablesCount > 0 ? ', alphaArray.buffer' : 'alphaArray.buffer');

					transferrablesCount ++;

				}


				var modelKeys = Object.keys(this.rawData);

				modelKeys.forEach(function(key){

					message.push( transferrablesCount > 0 ? ', ' + key + ': model["' + key + '"]' : key + ': model["' + key + '"]');

					transferrables.push( transferrablesCount > 0 ? ', model["' + key + '"].buffer' : 'model["' + key + '"].buffer');

					transferrablesCount ++;

				});




				this.program.push(message.join(''), '} }, [', transferrables.join(''), ']);');


				this.program.push(this.positionsProgram ? 'positionArray = new Float32Array(' + this.partialDeliver3Times + ');' : '');


				this.program.push(this.colorsProgram ? 'colorArray = new Float32Array(' + this.partialDeliver3Times + ');' : '');


				this.program.push(this.sizesProgram ? 'sizeArray = new Float32Array(' + this.recordsPartialDeliverCount + ');' : '');


				this.program.push(this.sizesProgram ? 'alphaArray = new Float32Array(' + this.recordsPartialDeliverCount + ');' : '');


				this.program.push('initModel(dataModel_, ' + this.recordsPartialDeliverCount + ');');

			}


	this.program.push(

		"}"

	);


	this.program.push(this.messengerProgramHead.join('\n'));

	this.program.push(this.messengerProgramBody.join('\n'));

	this.program.push(this.messengerProgramTail.join('\n'));

	var text = this.program.join('\n');


	var workerBlob = new Blob([text]);


	var workerURL = window.URL.createObjectURL(workerBlob);

		this.worker = new Worker(workerURL);




		this.worker.onerror = function(e){

			console.log('Error from background model generator worker', 'ERROR: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);

		};


		this.worker.onmessage = function(e){

			var data = e.data;


			if(data.messageType)

    			switch (data.messageType){

    				case 'positionArray':
    					this.positionArray = data.content;
    					break;


					case 'colorArray':
						this.colorArray = data.content;
						break;

					case 'sizeArray':
						this.sizeArray = data.content;
						break;

					case 'alphaArray':
						this.alphaArray = data.content;
						break;

					case 'model':
						this.rawData = data.content;
						break;

					case 'transferrables':
						that.updateGeometryModelArrays(data.transferrables, data.offset, data.finalIndex);
						break;


					case 'info':
						console.log(data.content);
						break;


					default:
						console.log('Received the following message from background thread. But I don\'t know what to do with it: ', data.content);
						break;

    			}


		};


		this.worker.postMessage({ cmd: 'initModel', dataModel: this.dataModelForWorker, recordsCount: this.recordsPartialDeliverCount });

		return this;

};


/**
* Appends records to the thread's data model and processes them with the position, color, size and alpha script provided before initialization.
*
* @method processRecords
* @param {Array} records The array of records to be appended to the model.
* @param {offset} Initial position in the thread's array for the appended records.
*
**/
VOne.BackgroundModelGenerator.prototype.processRecords = function(records, offset){

	this.worker.postMessage({ cmd: 'processRecords', records: records, offset: offset });

};


/**
* Sets an extra object in the worker in case you need it for operations to set positions, colors, etc. It will be available as a variable named extras. Must be called after init() method.
*
* @method setExtrasForWorker
* @param {Object} extras An object to be available as 'extras'.
*
**/
VOne.BackgroundModelGenerator.prototype.setExtrasForWorker = function(extras){

	this.worker.postMessage({ cmd: 'setExtras', extras: extras });

};


VOne.BackgroundModelGenerator.prototype.updateGeometryModelArrays = function(data, offset, finalIndex){

	var that = this;

	if(data.positionArray){

		this.positionArray.set(data.positionArray, offset * 3);
		this.geometry.attributes.position.needsUpdate = true;

	}


	if(data.colorArray){

		this.colorArray.set(data.colorArray, offset * 3);
		this.geometry.attributes.color.needsUpdate = true;

	}


	if(data.sizeArray){

		this.sizeArray.set(data.sizeArray, offset);
		this.geometry.attributes.size.needsUpdate = true;

	}


	if(data.alphaArray){

		this.alphaArray.set(data.alphaArray, offset);
		this.geometry.attributes.alpha.needsUpdate = true;

	}



	this.modelKeys.forEach(function(key){

		that.rawData[key].set(data[key], offset);

	});



	this.dataModel = new Proxy(this.rawData, {

		get: function(target, name){

			var o = { };


			that.modelKeys.forEach(function(key){

				o[key] = that.rawData[key][name];

			});


			return o;

		},


	});



	this.setGeometryDrawRangeCount(finalIndex - 1);

	this.geometry.computeBoundingSphere();

};


VOne.BackgroundModelGenerator.prototype.typedArrayToString = function(ua) {
	var binstr = Array.prototype.map.call(ua, function (ch) {
		return String.fromCharCode(ch);
	}).join('');
	var escstr = binstr.replace(/(.)/g, function (m, p) {
		var code = p.charCodeAt(p).toString(16).toUpperCase();
		if (code.length < 2) {
			code = '0' + code;
		}
		return '%' + code;
	});
	return decodeURIComponent(escstr);
};
