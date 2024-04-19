class vi_Map {

  constructor(controller,domains) {
    // ...

  
    this.controller = controller;



    domains.forEach((domain)=>{

      this.controller.addObserver(domain,'objectSelected', this.handleObjectSelectedOutside.bind(this));
      this.controller.addObserver(domain,'objectAdded', this.addObject.bind(this));
      this.controller.addObserver(domain,'objectUpdated', this.updateObject.bind(this));
      this.controller.addObserver(domain,'objectDeleted', this.removeObject.bind(this));

    });

   


      this.viewer = null;
      this.objectEntity = null;
      this.tooltipElement = null;
  
      this.currentLatitude = 25.6520;
      this.currentLongitude = -100.3152;

      this.objectEntities = [];
      this.polylineEntities = [];
      this.mapGeometries = {};

      this.MapLib;

      this.container;
      
      
    }


    initialize() {
      // Initialize the map
    }


    setupToolBox(toolbox){
      this.container.appendChild(toolbox.getToolboxElement());
    }

    entityBuilder(newObject){

      const id = newObject.id; // Use the mobile object's ID as the cylinder ID
      const initialLatitude = newObject.data.position._lat; // Use the mobile object's latitude
      const initialLongitude = newObject.data.position._long; // Use the mobile object's longitude
    

        
      const geometries = this.geometryBuilder(newObject.collection);


     var entities = [];

     geometries.forEach(geometry => {

        var ox = 0;
        var oy = 0;
        var oz = 0;

      
        if(geometry.offset){
          ox = geometry.offset.x;
          oy = geometry.offset.y;
          oz = geometry.offset.z;
        }

          const objectCoordinates = this.MapLib.Cartesian3.fromDegrees(
            initialLongitude+ ox,
            initialLatitude+ oy,
            oz
          );



        const entity = {
          position: objectCoordinates,
          name:  id,
          ...geometry,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        };

        entities.push(entity);


     });

      

      return entities;

    }



 
    addObjectGeometry(key, objectType) {
    if (this.mapGeometries.hasOwnProperty(key)) {
      console.error(`An object type with key '${key}' already exists.`);
    } else {
      this.mapGeometries[key] = objectType;
      console.log(`Object type with key '${key}' added successfully.`);
    }
  }

  // Method to retrieve an object type using the key
  geometryBuilder(key) {
    if (this.mapGeometries.hasOwnProperty(key)) {

      const geom = this.mapGeometries[key];

      return geom;
    
    } else {

      const geom = [{
        cylinder: {
        length: 1000,
        topRadius: 10,
        bottomRadius: 10,
        material: this.MapLib.Color.GREEN,
        clampToGround: true
      }}];
       
      return geom;
    }
  }

  // Method to log all object types
  logObjectTypes() {
    console.log('Object Types:');
    console.log(this.mapGeometries);
  }
}


  

  export default vi_Map;