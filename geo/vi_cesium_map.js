/*

  VISUAL INTERACTION SYSTEMS

  MAPA Generico usando CESIUM


*/

import vi_Map from '/front/viOne/geo/vi_map.js'; 
import { decode, encode } from "/front/viOne/js/@googlemaps/polyline-codec/dist/index.esm.js";
 


class vi_CesiumMap extends vi_Map {

  constructor(controller, domains, config) {
    

      super(controller, domains);

      this.previousCameraAltitude = null; 
      this.f = null;

      this.markerWidth = 1000.0;
      this.markerHeight = 2500;


      if(config){
        this.markerWidth = config.markerWidth;
        this.markerHeight = config.markerHeight;
      }



     
      
    }
  
    async loadMap(map_window) {

      this.container = document.getElementById(map_window);

      await this.loadExternalFiles();
  
      this.MapLib = Cesium;
    
     
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODczNzBiYy0xOGZmLTQyOWEtYjdjNy00NmM1YzlhYWUzOWMiLCJpZCI6MTQ3MDQ0LCJpYXQiOjE2ODY4MDYxNjR9.8OgBzwtTc65BVPlZbo6MOozogPQMsnUtc4Hg9lBFLMQ';


            this.viewer = new Cesium.Viewer(map_window, {
                terrain: Cesium.Terrain.fromWorldTerrain(),
                pickEnabled: true,
                timeline: false,
            });
  
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                -100.3152,
                25.6520,
                5000
                ),
                orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-15.0),
                },
            });

            this.viewer.camera.moveEnd.addEventListener(this.handleCameraMove.bind(this));
  
  
            // Add Cesium OSM Buildings, a global 3D buildings layer.
           const buildingTileset = await Cesium.createOsmBuildingsAsync();
            this.viewer.scene.primitives.add(buildingTileset);

           

            this.viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
              if (Cesium.defined(selectedEntity)) {
                if (Cesium.defined(selectedEntity.name)) {
                  const uniqueId = selectedEntity.name;
                  const objectData = this.objectEntities[uniqueId];
            
                  if (objectData) {

                    const payload = {id:uniqueId}
                    
                    this.controller.triggerObjectPicked(objectData.collection, payload);
                  }
                } else {
                  console.log('Unknown entity selected.');
                }
              } else {
                console.log('Deselected.');
              }
            });


            // Inicializa Reloj y Marker

            var start = Cesium.JulianDate.fromIso8601('2018-01-01T00:00:00.00Z');
            var mid = Cesium.JulianDate.addSeconds(start, 5, new Cesium.JulianDate());
            var stop = Cesium.JulianDate.addSeconds(start, 10, new Cesium.JulianDate());
            
            this.clock = this.viewer.clock;
            this.clock.startTime = start;
            this.clock.currentTime = start;
            this.clock.stopTime = stop;
            this.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
            //this.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
      
            //this.clock.shouldAnimate = true;
      
            
            this.pulseProperty = new Cesium.SampledProperty(Number);
            this.pulseProperty.setInterpolationOptions({
                interpolationDegree : 3,
                interpolationAlgorithm : Cesium.HermitePolynomialApproximation
            });
            
            this.pulseProperty.addSample(start, 7.0);
            this.pulseProperty.addSample(mid, this.markerWidth);
            this.pulseProperty.addSample(stop, 7.0);




     
    }

    async loadExternalFiles() {
      // Define the URLs of the JavaScript and CSS files
      //const cesiumJsUrl =
     //   'http://cesium-dev.s3-website-us-east-1.amazonaws.com/cesium/worker-inline/Build';
     // const cesiumCssUrl =
     //   'http://cesium-dev.s3-website-us-east-1.amazonaws.com/cesium/worker-inline/Build/Cesium/Widgets/widgets.css';
  
      const cesiumJsUrl = '/front/viOne/js/Cesium/Cesium.js';

      const cesiumCssUrl = '/front/viOne/js/Cesium/Widgets/widgets.css';
  



      // Create a script element for the Cesium JavaScript
      const cesiumJsScript = document.createElement('script');
      cesiumJsScript.src = cesiumJsUrl;
  
      // Create a link element for the Cesium CSS
      const cesiumCssLink = document.createElement('link');
      cesiumCssLink.href = cesiumCssUrl;
      cesiumCssLink.rel = 'stylesheet';
  
      // Append the script and link elements to the head of the document
      document.head.appendChild(cesiumJsScript);
      document.head.appendChild(cesiumCssLink);
  
      // Return a promise that resolves when both files are loaded
      return Promise.all([
        new Promise((resolve) => {
          cesiumJsScript.onload = resolve;
        }),
        new Promise((resolve) => {
          cesiumCssLink.onload = resolve;
        }),
      ]);
    }
  
    

    handleCameraMove() {
      // Get the camera's altitude (distance from the ground)
      const cameraAltitude = this.viewer.camera.positionCartographic.height;
  
      // Define a threshold or delta value for significant change
      const threshold = 100; // Adjust this value as needed
  
      // Check if cameraAltitude has changed significantly
      if (this.previousCameraAltitude === null || Math.abs(cameraAltitude - this.previousCameraAltitude) >= threshold) {
          // Calculate a scaling factor based on the camera's altitude
          const scalingFactor = this.calculateScalingFactor(cameraAltitude);
  
          console.log("ALTITUD : ", cameraAltitude, "FACTOR : ", scalingFactor);
  
          // Update the scale of all cylinders
          this.updateObjectsScale(scalingFactor);
  
          // Update the previousCameraAltitude
          this.previousCameraAltitude = cameraAltitude;
      }
  }


  captureScene(scene, filename) {
    // Get the rendered content from the scene
    var imageDataURL = scene.canvas.toDataURL('image/png');

    // Create a temporary anchor element to trigger the download
    var link = document.createElement('a');
    link.href = imageDataURL;
    link.download = filename;

    // Trigger a click event on the anchor to prompt the browser to download the image
    link.click();
}

  lookDown(){
    var pitch =  -Math.PI / 2; // Angle to look down (in radians)
    var heading = this.viewer.camera.heading; // Keep the current heading
    this.viewer.camera.setView({
        orientation: {
            pitch: pitch,
            heading: heading
        }
    });  
  }

  lookUp(){
    var pitch =  Math.PI / 2; // Angle to look down (in radians)
    var heading = this.viewer.camera.heading; // Keep the current heading
    this.viewer.camera.setView({
        orientation: {
            pitch: pitch,
            heading: heading
        }
    });  
  }

  lookFront() {
    var pitch = 0; // Angle to look straight ahead (in radians)
    var heading = this.viewer.camera.heading; // Keep the current heading
    this.viewer.camera.setView({
        orientation: {
            pitch: pitch,
            heading: heading
        }
    });  
}

lookRight() {
  var pitch = this.viewer.camera.pitch; // Keep the current pitch
  var heading = this.viewer.camera.heading + Math.PI / 2; // Increase heading by π/2 radians

  // Ensure that the heading stays within the range [-π, π]
  heading = Cesium.Math.zeroToTwoPi(heading);

  this.viewer.camera.setView({
      orientation: {
          pitch: pitch,
          heading: heading
      }
  });  
}


    handleObjectSelectedOutside(domain, event, payload) {
    
      // Check if the payload has the ID
      if (payload.id && this.objectEntities[payload.id]) {

        const objectEntity = this.objectEntities[payload.id];

        if(objectEntity){
          this.viewer.flyTo(objectEntity.entities);
        }

       
      } else {
        console.log("Object Entity not found by ID:", payload.id);
      }
    }

   
    
   
    
    calculateScalingFactor(x) {
      const m = 9 / 9950; // Slope
      const b = 154 / 199; // Y-intercept
    
      const y = m * x + b;
      return y;
    }

    updateObjectsScale(scalingFactor) {

      /*

        console.log("ESCALANDO");
        // Iterate through all cylinder entities and update their scale
        for (const id in this.objectEntities) {
            if (this.objectEntities.hasOwnProperty(id)) {
                const objectEntity = this.objectEntities[id];

                // Update the cylinder's scale
                objectEntity.cylinder.length = 1000 * scalingFactor; // Adjust the length as needed
                objectEntity.cylinder.topRadius = 10 * scalingFactor; // Adjust the top radius as needed
                objectEntity.cylinder.bottomRadius = 10 * scalingFactor; // Adjust the bottom radius as needed
            }
        }

        */
    }
  
   
  

   
    addObject(domain, event, newObject) {

    

            const entities = this.entityBuilder(newObject);

            var entitiesList = [];


            //const objectEntity = this.viewer.entities.add(entity);

            entities.forEach(entity => {
      
              const objectEntity = this.viewer.entities.add(entity);
              objectEntity.description = newObject.getFormatedData();
      
              entitiesList.push(objectEntity);

           });
       

      
           // this.objectEntities[newObject.id] = entitiesList; 
           this.objectEntities[newObject.id] = {id:newObject.id, collection:domain, entities:entitiesList};
       
    }
      

    updateObject(domain, event, updatedObject) {

      

      const id = updatedObject.id; // Use the mobile object's ID as the cylinder ID
      const newLatitude = updatedObject.data.position._lat; // Use the mobile object's latitude
      const newLongitude = updatedObject.data.position._long; // Use the mobile object's longitude


        const objectEntities = this.objectEntities[id];  

        
      
        if (objectEntities) {

          var maxh = 0;
             

          objectEntities.entities.forEach((entity) =>{

            const objectCoordinates = Cesium.Cartesian3.fromDegrees(
              newLongitude,
              newLatitude,
              entity.offset.z
            );

            if(maxh < entity.offset.z){
              maxh = entity.offset.z;
            }
        
            entity.position.setValue(objectCoordinates);

            //

            //entity.cylinder.material.color.setValue(Cesium.Color.fromCssColorString("#FFEAFF").withAlpha(1));
            //entity.cylinder.material.color.setValue(Cesium.Color.fromCssColorString("#FFEA00").withAlpha(1));

          
          }

          );



          if(this.f){
            this.f(updatedObject, objectEntities.entities);
          }


          this.placeMarker(newLatitude,newLongitude,maxh);

           

           
        }
        
    }



    onObjectUpdated(f){

       this.f = f;

    }


    placeMarker(newLatitude,newLongitude,h){

     if(this.marker){

      const objectCoordinates = Cesium.Cartesian3.fromDegrees(
        newLongitude,
        newLatitude,
        h
      );
  
      this.marker.position.setValue(objectCoordinates);


     } else {

      var pos = {
        position : Cesium.Cartesian3.fromDegrees(
          newLongitude,
          newLatitude,
          h
          ),
       
        ellipse: {
          semiMinorAxis: this.pulseProperty,
          semiMajorAxis: this.pulseProperty,
          height: this.markerHeight,
          material:  Cesium.Color.ORANGERED,
          outline: true, // height must be set for outline to display
          clampToGround: true
        },
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND



     };

     /*
      point : {
            pixelSize : this.pulseProperty,
            color : Cesium.Color.ORANGERED
        },
     */

      this.marker = this.viewer.entities.add(pos);
      
  
    }


    this.clock.shouldAnimate = true;
    this.clock.onStop.addEventListener(() => {
      this.clock.shouldAnimate = false;
  });


  }


    removeObject(domain, event, id) {
      const objectEntity = this.objectEntities[id]; // Get the cylinder entity by ID
      if (objectEntity) {
        this.viewer.entities.remove(objectEntity); // Remove the specified cylinder entity from the viewer
        delete this.objectEntities[id]; // Remove the reference from the local collection
      }
    }
       
  
   
  
    setupTooltip(tooltipHTML) {
      this.tooltipElement = document.getElementById('tooltip');
  
      this.viewer.screenSpaceEventHandler.setInputAction(
        (movement) => {
          const pickedObject = this.viewer.scene.pick(
            movement.endPosition
          );
          if (
            Cesium.defined(pickedObject) &&
            pickedObject.id === this.objectEntity
          ) {
            const tooltipPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              this.viewer.scene,
              this.objectEntity.position.getValue()
            );
  
            this.tooltipElement.innerHTML = tooltipHTML;
            this.tooltipElement.style.display = 'block';
  
            this.tooltipElement.style.left = `${movement.endPosition.x}px`;
            this.tooltipElement.style.top = `${movement.endPosition.y}px`;
          } else {
            //this.tooltipElement.style.display = 'none';
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }
  



    loadPolylineString(id, encodedPolyline) {

      const poly = this.polylineEntities[id]; 
      
      if(poly){

        this.viewer.zoomTo(poly.polylineEntity);

      } else {

      

              try {
                  // Assuming 'decode' directly returns an array of coordinates [latitude, longitude]
                  const coordinates = decode(encodedPolyline, 5);
          
                  // Create a Cesium entity with a polyline
                  const polylineEntity = this.viewer.entities.add({
                      polyline: {
                          positions: coordinates.map(coord => Cesium.Cartesian3.fromDegrees(coord[1], coord[0])), // Reversed order for Cesium
                          width: 5,
                          material: Cesium.Color.WHITE,
                          clampToGround: true,
                      },
                  });

                  this.polylineEntities[id] = {id:id, polylineEntity:polylineEntity};
          
                   

              } catch (error) {
                  console.error('Error decoding or loading polyline:', error);
              }

    }
  }


  setPolyline(id,color){

    const poly = this.polylineEntities[id]; 
      
    if(poly){

      

      poly.polylineEntity.polyline.material = Cesium.Color.fromCssColorString(color).withAlpha(1);

      
    }


  }


  flyToPolyline(id){
    const poly = this.polylineEntities[id]; 
      
    if(poly){


       

      this.viewer.zoomTo(poly.polylineEntity);
      
    }
  }


  

    async loadPolylineFromKML(id, url,altitude) {
      try {
       
    
        // Fetch KML content
        const response = await fetch(url);
        const kmlText = await response.text();
    
        // Parse KML content using DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    
        // Extract coordinates from KML
        const coordinates = [];
        const coordinatesNodes = xmlDoc.querySelectorAll('coordinates');
        coordinatesNodes.forEach(coordNode => {
          const coordText = coordNode.textContent.trim();
          const coordPairs = coordText.split(' ');
    
          coordPairs.forEach(coordPair => {
            const [lon, lat, /* ignore altitude */] = coordPair.split(',').map(parseFloat);
            if (!isNaN(lon) && !isNaN(lat)) {
              // Add the coordinates with an altitude of 500 meters
              coordinates.push(lon, lat, altitude);
            }
          });
        });
    
        // Check if we have enough coordinates
        if (coordinates.length < 6) {
          throw new Error('Not enough coordinates to create a polyline');
        }
    
        // Create polyline entity
        const polylineEntity = this.viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(coordinates),
            width: 2,
            material: Cesium.Color.RED,
            clampToGround: true,
          },
        });


        this.polylineEntities[id] = {id:id, polylineEntity:polylineEntity};
    
        // Zoom to the extent of the polyline
        this.viewer.zoomTo(polylineEntity);

      } catch (error) {
        console.error(error);
      }
    }

    clearPolylines(){
      this.polylineEntities.forEach((p)=>{
        var pp = p.polylineEntity;
        this.viewer.entities.remove(pp); 
      });
      this.polylineEntities = [];
    }
    
    

}
  
  export default vi_CesiumMap;
  