/**
* Assigns properties for multilevel/multicontained data arrays by traversing the complete array. Allows to set properties for last child elements and calculate total values for parents based on a given child value.
*
* @method assignLevelData
* @for VOne
*
* @param {Array} data The dataset to assign properties. Must have be in the following format: <br/> [ { keyName: keyname, valuesPropertyName: [values] }, ... { keyName: keyname, valuesPropertyName: [values] } ];
*
* @param {Object} config Settings for generating the distribution
* @param {string} config.parentPropertyName The keyName property (parent elements name). Default is 'key'.
* @param {string} config.childPropertyName The values property name to search for for each parent. Default is 'values'.
* @param {function | number} config.setTotalBy Function to be evaluated | value to assign as totalValue for each last child element. Each parent will contain in the 'totalValue' property the sum of all children assigned values.
* @param {string} config.storeTotalValueAs Used in conjunction with config.setTotalBy, indicates the property name to be assigned for totals. Each parent will hold this property as the sum of this property name of every child. Defaults to 'totalValue'
* @param {string} config.extendRecordsOn If you want to generate records based on a given property, set this property with the property which value is the amount of records to append. The last child record will be copied as many times this property indicates.
* @param {function} config.processLastChildAs Function to be executed on every last child record.  The function will receive the record for allowing you to make any aditional calculations and/or set new properties on/for it.
**/
VOne.assignLevelData = function(data, config){

	config = config || { };

	var childPropertyName = config.childPropertyName || 'values';
	var parentPropertyName = config.parentPropertyName || 'key';
	var totalPropertyName = config.storeTotalValueAs || 'totalValue';
	var setTotalBy = config.setTotalBy || undefined;
	var extendRecords = config.extendRecordsOn || false;
	var processChild = config.setProcessLastChild || undefined;

	var lastChildCount = 0;

	var assign = function(_data, currentLevel){


		if(Array.isArray(_data)){


			for(var i = 0; i < _data.length; i++){

			 	if(setTotalBy){

			 		_data[i][totalPropertyName] = 0;

			 	}

			 	_data[i].level = currentLevel;


			 	if(childPropertyName in _data[i]){

			 		var nextLevel = currentLevel + 1;

			 		assign(_data[i][childPropertyName], nextLevel);

			 		var index = 0;


			 		_data[i][childPropertyName].forEach(function(record){


			 			record.groupIndex = index;
			 			record.parent = _data[i];

			 			index++;


			 			if(!record[childPropertyName]){


			 				if(extendRecords && !record.traversed){

				 				for(var j = 1; j < record[extendRecords]; j++){

				 					_data[i][childPropertyName].push(record);
				 					lastChildCount++;

				 				}

				 				record.traversed = true;

		 					}


		 					if(setTotalBy){

				 				if('function' === typeof setTotalBy){

				 					record[totalPropertyName] = setTotalBy(record);


				 				} else {

				 					record[totalPropertyName] = setTotalBy;

				 				}

			 				}


			 				if(processChild){

			 					processChild(record);

			 				}


			 				lastChildCount++;


			 			}


			 			if(setTotalBy)
			 				_data[i][totalPropertyName] += record[totalPropertyName];



			 		});


			 		if(setTotalBy){

				 		_data[i][childPropertyName].sort(function(a, b){

		 					return a[totalPropertyName] - b[totalPropertyName];

		 				});

				 	}


			 	} else {

			 		return;

			 	}


			 }


		}


	}


	assign(data, 0);

}
