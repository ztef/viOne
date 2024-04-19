
class vi_mainCircle {

    constructor(radius, initialAngle = 0, origin = { x: 0, y: 0 , z:0}) {
      this.radius = Math.max(0, radius);
      this.initialAngle = initialAngle;
      
      this.origin = { ...origin };
      this.separation = 0;
    }
  
    divideCircle(level, totalMarkers) {
      const points = [];
      let delta = 0;
      let deltaAngle = 0;

      let angle = this.initialAngle;

     
        delta = this.separation*level;
        deltaAngle = ((2 * Math.PI) / (totalMarkers));

        if(level > 0){
            angle = angle - (deltaAngle/2);  // Desfase
        
        }

      
      for (let i = 0; i < totalMarkers; i++) {
       
        const x = this.origin.x + (this.radius+delta) * Math.cos(angle);
        const z = this.origin.z + (this.radius+delta) * Math.sin(angle);
        const y = this.origin.y;
        angle = angle - deltaAngle;
        points.push({ x, y, z });
      }
  
      return points;
    }
  
    getMarkerCoordinates(markerNumber, totalMarkers) {
      if (markerNumber < 0 || markerNumber >= totalMarkers) {
        console.error("Invalid marker number");
        return null;
      }
  
      const angle = (2 * Math.PI * markerNumber) / totalMarkers + this.initialAngle;
      const x = this.origin.x + this.radius * Math.cos(angle);
      const z = this.origin.z + this.radius * Math.sin(angle);
      const y = 0;

      return { x, y, z };
    }
  
    getAngleForMarker(markerNumber, totalMarkers) {
      if (markerNumber < 0 || markerNumber >= totalMarkers) {
        console.error("Invalid marker number");
        return null;
      }
  
      return (2 * Math.PI * markerNumber) / totalMarkers + this.initialAngle;
    }
  
  
    calculatePointsBetweenMarkers(markerNumber, m, totalMarkers) {
      const startAngle = this.getAngleForMarker(markerNumber, totalMarkers);
      const endAngle = this.getAngleForMarker((markerNumber + 1) % totalMarkers, totalMarkers);
  
      const stepSize = (endAngle - startAngle) / m;
  
      const points = [];
      for (let i = 0; i < m; i++) {
        const angle = startAngle - i * stepSize;
        const x = this.origin.x + this.radius * Math.cos(angle);
        const z = this.origin.z - this.radius * Math.sin(angle);
        const y = this.origin.y;

        points.push({ x, y, z });
      }
  
      return points;
  }
  
  
  
  
  }
  
  export class vi_HiperCircle {
  
  
    constructor(centralCircleRadius, initialAngle = 0, origin = { x: 0, y: 0 , z:0}) {
      this.centralCircle = new vi_mainCircle(centralCircleRadius, initialAngle, origin);
      this.totalMarkers = 0;
      this.levels = [];
      this.globalMap = new Map();
      this.graphics = {};
      this.render = null;
      this.geometry_factory = null;
      this.marker = null;
      this.markerColor = 0xB2BEB5;
      this.separation = 5;
      this.centralCircle.separation = this.separation; // delta de radio entre circulos (niveles)
      this.tree = '';
      this.levelsDef = null;
      this.hiperGeomFactory = null;

      this.initGraphics();
    }

    
     
  


    setHiperGeomFactory(hgf){
      this.hiperGeomFactory = hgf;
    }



  
    initGraphics(){
      this.graphics = {center:{lines:true}, mainline:true, labels :{ size:{size:0.7, height:0.1}, color:0x000000, align:true}, markers:{shape:'Circle',size:{size:0.8,definition:16}}};
    }
  
   
  getBoard(path){
    return this;
  }
  

  defineLevels(levelsDef){
    this.levelsDef = levelsDef;
  }



    setTree(tree){
      this.tree = tree;
    }
  
    setGraphics(graphics){
  
      this.graphics = graphics;
      if(!this.graphics.labels){
        this.graphics.labels = {size:1, height:0.3};
      }
      if(!this.graphics.markers){
        this.graphics.markers = {shape:'Circle',size:{size:.08,definition:16}};
      }
      if(!this.graphics.center)
       this.graphics.center={lines:true}
      
  
    }


    setRenderEngine(re,gf){
      this.render = re;
      this.geometry_factory = gf;
      this.setMarker();

  }

  setMarker(){

    this.marker = this.geometry_factory.createGeometry(this.graphics.markers.shape,[this.graphics.markers.size.size,this.graphics.markers.size.definition]);


  }

  
    setLevels(levels) {
      this.levels = levels;
      this.calculateTotalMarkers();
      for (let i = 0; i < levels.length; i++) {
        this.globalMap.set(i, this.calculatePointsForLevel(i));
      }
     
    }
  
  
    calculateTotalMarkers() {
      this.totalMarkers = this.levels.reduce((total, level) => total * level, 1);
    }
  
    getAngleForMarker(markerNumber) {
      return this.centralCircle.getAngleForMarker(markerNumber, this.totalMarkers);
    }
  
    divideCentralCircle() {
      if (this.totalMarkers === 0) {
        console.error("Total markers not set. Use setTotalMarkers method.");
        return null;
      }
  
      return this.centralCircle.divideCircle(this.totalMarkers);
    }
  
    getCoordinatesOfMarker(markerNumber) {
      if (this.totalMarkers === 0) {
        console.error("Total markers not set. Use setTotalMarkers method.");
        return null;
      }
  
      return this.centralCircle.getMarkerCoordinates(markerNumber, this.totalMarkers);
    }
  
    setTotalMarkers(totalMarkers) {
      this.totalMarkers = totalMarkers;
    }
  
    calculatePointsBetweenMarkers(markerNumber, m) {
      if (this.totalMarkers === 0) {
        console.error("Total markers not set. Use setTotalMarkers method.");
        return null;
      }
  
      return this.centralCircle.calculatePointsBetweenMarkers(markerNumber, m, this.totalMarkers);
    }
  
  
    getSegments(level){
  
      return this.globalMap.get(level);
    }


    getPathFromIndex(absoluteIndex, levels, level) {
      const path = [];
      let remainder = absoluteIndex;
      
      for (let i = level; i >= 0; i--) {
          const numsegments = levels[i];
          const division = Math.floor(remainder / numsegments);
          remainder %= numsegments;
          path.push(remainder); 
          remainder = division;
      }
      let prefix = this.tree;
      if (prefix != ''){prefix = prefix + '.'}

      if(this.levelsDef){
        prefix = this.levelsDef[level] + '.' + prefix;
      } else {
        prefix = 'marker.' + prefix;
      }
  
      return prefix + path.reverse().join('.');
  }



    draw(level){
        
      var points = this.getSegments(level);

      
      let init = this.centralCircle.origin;
      let pos = {...points[0]};
      

      let color = this.markerColor;

      let pointN = 0;

      points.forEach((point)=>{

          pos.x = point.x;
          pos.z = point.z;
          pos.y = point.y;

     

           
          var m = this.geometry_factory.createObject(this.marker,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
         
         
          m.rotation.x = -Math.PI /2 ;
         
          var o = this.geometry_factory.createVisualObject(m,this.getPathFromIndex(pointN,this.levels,level));

          pointN = pointN + 1;

          this.render.addGeometry(o); 

          if(level==0){
            if(this.graphics.center.lines){
                   this.render.addLine(init,pos);
            }
          }



      });



      if(this.graphics.center){
           this.drawCenter();
      }


     
    }


    drawCenter(){

      var pos =this.centralCircle.origin;
      var color = this.graphics.center.color;
   
      var g = this.geometry_factory.createGeometry('Circle',[this.graphics.center.amplitude,64]);
      var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: this.graphics.center.transparent, opacity: this.graphics.center.opacity});
      m.rotation.x = -Math.PI /2 ;
      
      var o = this.geometry_factory.createVisualObject(m,'hb');
   
      this.render.addGeometry(o); 
   
   
    }





    drawLabels(level, labels, offset){
      var points = this.getSegments(level);

      this.plotLabelsOnPoints(points, labels,offset)    

    
    }


    drawLabel(path, label, offset){

      let point = this.locatePointByPath(path);

      this.plotLabel(point, label, offset);

      return point;

    }

    plotLabelsOnPoints(points, labels, offset) {
      const numPoints = points.length;
  
      let j = 0;
      for (let i = 0; i < numPoints; i++) {
          const point = points[i];
          const label = labels[j] || ''; 
          this.plotLabel(point, label, offset );
          j = j + 1;
          if(j >= labels.length){
            j = 0;
          }

      }
    }   

   
    plotLabel(point, label, offset){

      const angle = this.getAngleForPoint(point);

      const offsetX =  offset * Math.cos(angle);
      const offsetZ =  offset * Math.sin(angle);

      let plotPoint ={x:0, y:0, z:0}

      plotPoint.x = point.x+offsetX;
      plotPoint.z = point.z-offsetZ;
      plotPoint.y = point.y;

      let rotate = {x:0, y:angle, z:0};

//      

     if(this.graphics.labels.html){


      let _label = this.hiperGeomFactory.getLabelObject(label, this.graphics.labels.html.size, this.graphics.labels.html.lod, this.graphics.labels.html.min, this.graphics.labels.html.max);        
       _label.position.set(plotPoint.x,plotPoint.y,plotPoint.z);
      this.render.add(_label);

     } else {
      this.render.addLabel(label,plotPoint,rotate,this.graphics.labels);
     }

    

}
  
  
  
    calculatePointsForLevel(level){ 
  
      var totalMarkersInLevel = 1;
      for(var i=0; i<=level; i++){
        totalMarkersInLevel = totalMarkersInLevel * this.levels[i];
      }
  
      return this.centralCircle.divideCircle(level, totalMarkersInLevel);
    }
  
  
    calculateLinesForLevel(level,lineLength){ 

      var totalMarkersInLevel = 1;
      for(var i=0; i<=level; i++){
        totalMarkersInLevel = totalMarkersInLevel * this.levels[i];
      }
  
      var lines = [];
  
      var puntos = this.centralCircle.divideCircle(totalMarkersInLevel);
   
      puntos.forEach((p)=>{
  
        const directionVector = {
          x: p.x - this.centralCircle.origin.x,
          z: p.z - this.centralCircle.origin.z
        };
  
        // Normalize the direction vector
        const length = Math.sqrt(directionVector.x ** 2 + directionVector.z ** 2);
        const normalizedVector = {
          x: directionVector.x / length,
          z: directionVector.z / length
        };
  
        // Calculate the endpoint coordinates based on the lineLength
        const endpoint = {
          x: this.centralCircle.origin.x + normalizedVector.x * lineLength,
          z: this.centralCircle.origin.z + normalizedVector.z * lineLength
        };
  
        // Use the provided callback function for drawing/rendering
        lines.push({
          start: { x: this.centralCircle.origin.x, z: this.centralCircle.origin.z },
          end: { x: endpoint.x, z: endpoint.z }
        });
  
       
  
      });
   
   
      return lines;
   
    }
  
   
  
    getCoordinatesForLevelAndMarker(level, markerNumber) {
      if (level < 0 || level >= this.levels.length) {
        console.error("Invalid level");
        return null;
      }
    
      const totalMarkersInLevel = this.levels[level];
    
      if (markerNumber < 0 || markerNumber >= totalMarkersInLevel) {
        console.error("Invalid marker number for the specified level");
        return null;
      }
    
      const markersInPreviousLevels = this.calculateMarkersInPreviousLevels(level);
      const markerIndex = markersInPreviousLevels + markerNumber;
    
  
      const upTo = this.calculateMarkersUpToLevel(level); 
      const points = this.centralCircle.divideCircle(upTo);
    
      return points[markerIndex % upTo];
    
    }
  
  
    
    calculateMarkersInPreviousLevels(level) {
      return this.levels.slice(0, level + 1).reduce((sum, current) => sum + current, 0) - this.levels[level];
    }
    
    calculateMarkersUpToLevel(level) {
      return this.levels.slice(0, level + 1).reduce((sum, current) => sum + current, 0) ;
    }
    
    
    
    
  
    getLineCoordinatesForLevelAndMarker(level, markerNumber) {
      const markerCoordinates = this.getCoordinatesForLevelAndMarker(level, markerNumber);
  
      if (!markerCoordinates) {
        return null;
      }
  
      // Return the coordinates for the line from the origin to the marker
      return [
        { x: this.centralCircle.origin.x, z: this.centralCircle.origin.z },
        { x: markerCoordinates.x, z: markerCoordinates.z }
      ];
    }
  
    getCoordinatesForAbsoluteMarker(absoluteMarkerNumber) {
      if (absoluteMarkerNumber < 0 || absoluteMarkerNumber >= this.totalMarkers) {
        console.error("Invalid absolute marker number");
        return null;
      }
    
      const points = this.centralCircle.divideCircle(this.totalMarkers);
      return points[absoluteMarkerNumber];
    }
  
  
    drawLinesForLevel(level, lineLength, drawCallback) {
      const totalMInLevel = this.calculateTotalMarkersInLevel(level);
  
     
  
      for (let _level = 0; _level <= level; _level++) {
  
  
        let mNumber = this.levels[_level];
  
        for(let m = 0; m < mNumber; m++){
  
        
           console.log("level:", _level, " m:", m);
  
            const markerCoordinates = this.getCoordinatesForLevelAndMarker(_level, m);
  
  
            if(!markerCoordinates){
              console.log('error');
            }
              
  
            // Calculate the direction vector from the origin to the marker
            const directionVector = {
              x: markerCoordinates.x - this.centralCircle.origin.x,
              z: markerCoordinates.z - this.centralCircle.origin.z
            };
  
            // Normalize the direction vector
            const length = Math.sqrt(directionVector.x ** 2 + directionVector.z ** 2);
            const normalizedVector = {
              x: directionVector.x / length,
              z: directionVector.z / length
            };
  
            // Calculate the endpoint coordinates based on the lineLength
            const endpoint = {
              x: this.centralCircle.origin.x + normalizedVector.x * lineLength,
              z: this.centralCircle.origin.z + normalizedVector.z * lineLength
            };
  
            // Use the provided callback function for drawing/rendering
            drawCallback({
              start: { x: this.centralCircle.origin.x, z: this.centralCircle.origin.z },
              end: { x: endpoint.x, z: endpoint.z }
            });
  
          }
      }
  
      
    }
  
  
    calculateAbsoluteMarkerNumber(level, markerNumber) {
      let totalMarkersBeforeLevel = 0;
      for (let i = 0; i < level; i++) {
        totalMarkersBeforeLevel += this.calculateTotalMarkersInLevel(i);
      }
      return totalMarkersBeforeLevel + markerNumber;
    }
  
  
  
    calculateTotalMarkersInLevel(level) {
      let totalMarkersInLevel = 1;
      for (let i = 0; i <= level; i++) {
        totalMarkersInLevel *= this.levels[i];
      }
      return totalMarkersInLevel;
    }
  
  
    locatePointByPath(path) {
      const pathSegments = path.split('.').map(Number);
  
      if (!pathSegments.every(Number.isInteger)) {
        console.error('Invalid path. Each segment in the path must be a number.');
        return null;
      }
  
  
      // acumula el valor de cada nievel como si fueran centenas, decenas, unidades
  
      var levelvalues = [];
      for(let i=0; i < this.levels.length; i ++)
      {
        let v = 1;
        for(let j=i+1; j < this.levels.length; j ++){
            v = v * this.levels[j]; 
        }
  
        levelvalues.push(v);
      }
  
  
      // calculate the absolute index :
  
      var index = 0;
      for(let i=0; i< pathSegments.length-1; i++){
        index = index + pathSegments[i] * levelvalues[i];
      }
  
      index = index + pathSegments[pathSegments.length-1];
  
      let currentPoints = this.globalMap.get(pathSegments.length-1);
      
  
      return currentPoints[index];
    }
  
    calculateAngleFromOrigin(x, z, ox, oz) {
      return Math.atan2(oz-z, x - ox);
    }
  
    getAngleForPoint(point){
  
      const angle = this.calculateAngleFromOrigin(point.x, point.z, this.centralCircle.origin.x, this.centralCircle.origin.z);
      
      return angle;
  
    }
  
  
  }
  
  