class vi_Segment {
    constructor(basePoint, length, angle) {
      this.basePoint = { ...basePoint };
      this.length = length;
      this.angle = angle;
    }
  
   
  
    generatePoints(numPoints) {
      const points = [];
  
      for (let i = 0; i < numPoints; i++) {
        const t = (2 * i + 1) / (2 * numPoints); // Calculate the middle point within each subdivision
        const x = this.basePoint.x + this.length * Math.cos(this.angle) * t;
        const z = this.basePoint.z - this.length * Math.sin(this.angle) * t;
        const y = this.basePoint.y; // y permanece constante
        points.push({ x, y, z });
      }
  
      return points;
    }
  
    
  }
  
  
  export class vi_HiperLine {
    constructor(length, angle,origin ) {
      this.origin = { ...origin };
      this.angle = angle;
      this.length = length || 0;
      this.separation = 5;
      this.globalMap = new Map();
      this.graphics = {};
      this.render = null;
      this.marker = null;
      this.markerColor = 0x808080;
      this.tree = '';
      this.levelsDef = null;
      this.hiperGeomFactory = null;
    
      this.initGraphics();
    }

   
    setHiperGeomFactory(hgf){
      this.hiperGeomFactory = hgf;
    }

    initGraphics(){
      this.graphics = {mainline:true, labels :{ size:{size:0.7, height:0.1}, color:0x000000, align:true}, markers:{shape:'Circle',size:{size:0.8,definition:16}}};
    }

    getBoard(path){
      return this;
    }

  
    defineLevels(levelsDef){
      this.levelsDef = levelsDef;
    }

    setRenderEngine(re,gf){
        this.render = re;
        this.geometry_factory = gf;
        this.setMarker();

    }

  
    setLength(length) {
      this.length = Math.max(0, length);
    }
  
  
    setLevels(levels) {
      this.levels = levels || [];
      // Calculate and store points for each level in the global map
      for (let i = 0; i < levels.length; i++) {
        this.globalMap.set(i, this.calcSegments(i));
      }
    }

    
    setGraphics(graphics){
      this.graphics = graphics;
      if(!this.graphics.markers){
        this.graphics.markers = {shape:'Circle',size:{size:.08,definition:16}};
      }
      
    }
  
  
    getSegments(level){
  
      return this.globalMap.get(level);
    }
  
    calcSegments(level){
  
      const basePoint = this.origin;
      const length = this.length;
      const angle = this.angle;
      var acumPoints = [];
  
      const segment = new vi_Segment(basePoint, length, angle);  // convierte la linea en un segmento
  
  
      var startLevel = 0;

      const separationX =  this.separation * Math.sin(this.angle);
      const separationZ =  this.separation * Math.cos(this.angle);
  
      const divideRecursive = (currentLevel, segment) => {
        if (currentLevel <= level) {
  
          var points = segment.generatePoints(this.levels[currentLevel]); 
  
  
          let delta = segment.length / points.length;
          points.forEach((p)=>{
      
  
            //p.y = p.y + level * this.separation;
  
  
            if(level>0){
            
            p.x -= separationX;
            p.z -= separationZ;
  
          }
  
  
  
            if(currentLevel == level){
                acumPoints.push(p);
            }
  
            var seg = new vi_Segment(p, delta, angle );
      
            divideRecursive(currentLevel + 1, seg);
      
          })
  
        }
      };
  
      divideRecursive(startLevel, segment);
  
  
      return acumPoints;
  
  
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
  
  
  
    getAngleForPoint(point){
  
      const angle =    Math.PI / 2 + this.angle;
      
      return angle;
  
    }



    getEndpoint(l) {
      
      var endX = this.origin.x + l * Math.cos(this.angle);
      var endZ = this.origin.z - l * Math.sin(this.angle);
  
      
      return { x: endX, y:0, z: endZ };
  }



  setMarker(){

   
    this.marker = this.geometry_factory.createGeometry(this.graphics.markers.shape,[this.graphics.markers.size.size,this.graphics.markers.size.definition]);


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

  setTree(tree){
    this.tree = tree;
  }

    draw(level){
        
            var points = this.getSegments(level);

            
            let init = {...points[0]};
            let pos = {...points[0]};
            

            let color = this.markerColor;

            let pointN = 0;

            points.forEach((point)=>{

                pos.x = point.x;
                pos.z = point.z;
                pos.y = 0;

                 
                var m = this.geometry_factory.createObject(this.marker,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            
                m.rotation.x = -Math.PI /2 ;
            
            
                var o = this.geometry_factory.createVisualObject(m,this.getPathFromIndex(pointN,this.levels,level));

                pointN = pointN + 1;

                this.render.addGeometry(o); 

            });


            if(level==0){

                if(this.graphics.mainline){
                  let long = this.length + this.length / this.levels[0];
                  this.render.addLine(init,this.getEndpoint(long));
                }
            } else {
                if(this.graphics.innerlines){
                    this.render.addLine(init,pos);
                }

            }
      }


      drawLabels(level, labels, offset){
        var points = this.getSegments(level);

        this.plotLabelsOnPoints(points, labels,offset)    

      
      }


      drawLabel(path, label, offset){

        let point = this.locatePointByPath(path);
        this.plotLabel(point, label, offset);

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

                const offsetX =  offset * Math.cos(this.angle+Math.PI/2);
                const offsetZ =  offset * Math.sin(this.angle+Math.PI/2);
        

                let plotPoint = {x:0, y:0, z:0};
                plotPoint.x = point.x + offsetX;
                plotPoint.z = point.z + offsetZ;
                plotPoint.y = 0;


                let rotate = {x:0, z:0, y:this.angle+Math.PI/2};

                if(this.graphics.labels.html){

                  let _label = this.hiperGeomFactory.getLabelObject(label, this.graphics.labels.html.size, this.graphics.labels.html.lod, this.graphics.labels.html.min, this.graphics.labels.html.max);
                  _label.position.set(plotPoint.x,plotPoint.y,plotPoint.z);
                  _label.rotation.z = -Math.PI / 2;

                  this.render.add(_label);
            
                 } else {
                  this.render.addLabel(label,plotPoint,rotate,this.graphics.labels);
                 }
                
      }
    
  }