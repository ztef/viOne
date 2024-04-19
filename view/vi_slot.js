export class vi_slot {

    constructor(point, delta, axis, angle){
        this.point =  {...point};
        this.delta = delta;
        this.axis = axis;
        this.angle = angle;
        this.elements = new Map();
    }

    addElement(id, element){

        this.elements.set(id, element);

    }


    getElement(e){
        return this.elements.get(e);
    }

    getVectorEndpoint(x,z, angle, distance) {
      
        var endX = x + distance * Math.cos(angle);
        var endZ = z - distance * Math.sin(angle);
     
        return { x: endX, y:0, z: endZ };
    }

    getTopPoint(){

        let topPoint = {...this.point};
        let distance = this.elements.size * this.delta + this.delta;

        if(this.axis == 'y'){
            topPoint[this.axis] = distance;
        }

        if(this.axis == 'z'){
            var p = this.getVectorEndpoint(topPoint.x, topPoint.z, this.angle  , distance);
            topPoint.x = p.x;
            topPoint.z = p.z;

        }

        return topPoint;

    }


}