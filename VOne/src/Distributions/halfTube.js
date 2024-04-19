/**
* Creates a series of points almost evenly distributed among a partial cilinder surface.
*
* @method halfTube
* @for VOne
*
* @param {number} pointsCount Number of points to map
* @param {THREE.Vector3} center Center of the cilinder
* @param {Object} config
* @param {number} config.height Height of the cilinder. Default is 500.
* @param {number} config.radius Radius of the cilinder. Default is 1000;
* @param {number} config.startPhi Starting angle in degress of the partial cilinder. Default is 180.
* @param {number} config.endPhi Ending angle in degress of the partial cilinder. Default is 360.
* @param {number} config.pointsPerRow Points to draw for each row of points in the cilinder. Default is 12.
*
* @return {Float32Array} An array of positions where x = index * 3, y = index * 3 + 1 and z = index * 3 + 2 (An array to be used as position attribute in a buffer geometry).
**/
VOne.halfTube = function(pointsCount, center, config){

    pointsCount = pointsCount || 1000;

    center = center || { x: 0, y: 0, z: 0 };

    config = config || { };

    var height = config.height || 500;
    var radius = config.radius || 1000;
    var startPhi = config.startPhi || 180;
    var endPhi = config.endPhi || 360;
    var pointsPerRow = config.pointsPerRow || 12;


    var rows = Math.ceil(pointsCount / pointsPerRow);

    var dy = height / rows;

    if(startPhi > endPhi){

        var tmp = startPhi;

        startPhi = endPhi;

        endPhi = tmp;

    }


    var angleDiff = (endPhi - startPhi) / pointsPerRow * VOne.degToRad;

    var startAngle = startPhi * VOne.degToRad + angleDiff / 2;

    var currentAngle = startAngle;

    var currentY = center.y - height / 2;


    var positionArray = new Float32Array(pointsCount * 3);

    var x, z;


    for(var i = 1; i <= pointsCount; i++){

        var indx = i - 1;

        x = radius * Math.cos(currentAngle);

        z = radius * Math.sin(currentAngle);

        positionArray[indx * 3] = center.x + x;
        positionArray[indx * 3 + 1] = currentY;
        positionArray[indx * 3 + 2] = center.z + z;

        if(i % pointsPerRow !== 0 && i !== 0){

            currentAngle += angleDiff;

        } else {

            currentAngle = startAngle;
            currentY += dy;

        }

    }


    return positionArray;

};
