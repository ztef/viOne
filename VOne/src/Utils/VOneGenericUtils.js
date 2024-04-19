function toRadians(angle) {
	return angle * VOne.degToRad;
}


function loadJSON(path, callback) {

    var xobj = new XMLHttpRequest();

        xobj.overrideMimeType("application/json");

	    xobj.open('GET', path, true);

	    xobj.onreadystatechange = function () {
	         if (xobj.readyState == 4 && xobj.status == "200") {

            	callback(xobj.responseText);

        	}

    	};

    xobj.send(null);

 }


 function calculateXYInRadius(angle, radius){


    var angleInRadians = toRadians(angle);

    return { x: Math.cos(angleInRadians) * radius,
            y: Math.sin(angleInRadians) * radius
        };

 }


function getAngleInDegreesFromCenter(position){

    var angleDeg = Math.atan2(position.y, position.x) * VOne.radToDeg;

    return angleDeg;

}




 function randomCoordsInRadius(r, uniform) {

    //r = r || 1000;

    var a = Math.random(),
        b = Math.random();

    if (uniform) {
        if (b < a) {
            c = b;
            b = a;
            a = c;
        }
    }

    return { x: b * r * Math.cos( 2 * Math.PI * a / b ), y: b * r * Math.sin( 2 * Math.PI * a / b ) };

}


function nearestPow2(val){
  return Math.pow(2, Math.round(Math.log(val) / Math.log(2) ));
}


function randomCoordsInCircle(r, uniform) {

    r = r || 100;

    var a = Math.random(),
        b = Math.random();

    if (uniform) {
        if (b < a) {
            c = b;
            b = a;
            a = c;
        }
    }

    return [b * r * Math.cos( 2 * Math.PI * a / b ), b * r * Math.sin( 2 * Math.PI * a / b )];
}


function randomCoordsInSphere(r, uniform){

	var u = Math.random();
   	var v = Math.random();

	if (uniform) {
		if (v < u) {
			w = v;
			v = u;
			u = w;
		}
	}

	var theta = VOne.DoublePI * u;
	var phi = Math.acos(2 * v - 1);
	var x = r * Math.sin(phi) * Math.cos(theta);
	var y = r * Math.sin(phi) * Math.sin(theta);
	var z = r * Math.cos(phi);

	return [x,y,z];

}


Array.prototype.extend = function (other_array) {
    other_array.forEach(function(v) {this.push(v); }, this);
};
