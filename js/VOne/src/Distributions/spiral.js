/**
* Creates a spiral layout based on the Archimedes Spiral by assigning a position for each record in the provided data set.
*
* @method spiral
* @for VOne
*
* @param {Array} data The dataset to distribute.
*
* @param {Object} config Settings for generating the layout
* @param {Number} config.centerX The X center position. Default is 0.
* @param {Number} config.centerY The Y center position. Default is 0.
* @param {String} config.sizePropertyName The property name for each record. Default is radius. It can be set using config.setSize.
* @param {function || Number} config.setSize A function that can be used to set the radius for each element.<br/> ex: <br/>config: { ..., <br/> setSize: function(element, index) { <br/> return element.total * 6.66; <br/>}, <br/>... } <br/>
* @param {String} config.positionPropertyName The position property name where the result of each record in the data set will be stored.
* @param {Number} config.linearPadding Distance between elements along the spiral. Default is 0.
* @param {Number} config.radialPadding Padding applied each spiral cicle (proportional).
* @param {Number} config.z Z position for the spiral. Default is 0.
* @param {Bool} config.looseSpiral If set to true, padding params will be ignored and a loose spiral (Archimedes spiral) will be created.
* @param {Number} config.startRadius Initial radius (a margin radius at the center). Default is 0.
**/

VOne.spiral = function(data, config){

    config = config || { };
    var centerX = config.centerX || 0;
    var centerY = config.centerY || 0;
    var sizePropertyName = config.sizePropertyName || 'radius';
	var positionPropertyName = config.positionPropertyName || 'position';
    var setSize = config.setSize || false;
    var linearPadding = config.linearPadding || 0;
    var radialPadding = config.radialPadding || 0;
    var z = config.z || 0;
    var looseSpiral = config.looseSpiral || false;


    var lastRadius = config.startRadius || 0;;
    var lastSize = 0;
    var lastAngle = 0;

    var x, y, nextRadius, nextAngle;


    for(var i = 0; i < data.length; i++){

        if(setSize){

            if(typeof setSize === 'function') {
                data[i][sizePropertyName] = setSize(data[i], i);
            } else {
                data[i][sizePropertyName] = setSize;
            }

        }

        if(looseSpiral){

            nextRadius = lastRadius + data[i][sizePropertyName] * VOne.GoldenRatio;

        } else{

            nextRadius = lastRadius > 0 ? lastRadius + (2 * Math.pow(data[i][sizePropertyName], 2) + radialPadding) / Math.PI / lastRadius / 2 /** VOne.GoldenRatio*/ : data[i][sizePropertyName];

        }



        nextAngle = Math.atan((lastSize + data[i][sizePropertyName] + linearPadding) / lastRadius) + lastAngle;


        x = centerX + nextRadius * Math.cos(nextAngle);
        y = centerY + nextRadius * Math.sin(nextAngle);

        data[i][positionPropertyName] = new THREE.Vector3(x, y, z);

        lastSize = data[i][sizePropertyName];

        lastRadius = nextRadius;

        lastAngle = nextAngle;

    }

};
