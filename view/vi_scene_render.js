/*


    VISUAL INTERACTION SYSTEMS

    General Purpose 3DScene Renderer on top of Three.js 




*/

import vi_Renderer from './vi_renderer.js'; 

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PerspectiveCamera, OrthographicCamera, LOD } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
 
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
 
import {vi_Font } from "./vi_font.js";
import {vi_Icon } from "./vi_icon.js";


import SelectionIndicator from './vi_selector_indicator.js';

export class vi_3DSceneRenderer extends vi_Renderer {
    constructor(containerId, controller, domains,  useOrthographicCamera = false) {


        super(controller, domains);


        this.container = document.getElementById(containerId);
        this.objects = new Map();
        this.useOrthographicCamera = useOrthographicCamera; // Determine camera type
       
        this.selectedObject = null;

       
        this.font = vi_Font.getFont();

        this.infoWindow = null;


        this.startPosition = null;
        this.targetPosition = null;
        this.startLookAt = null;
        this.targetLookAt = null;
        this.duration = null;
    
        this.startTime = Date.now();
        this.endTime = this.startTime + 5;


        this.selectedObject = null;
        this.selectedCustomObject = {};
        this.selectedID = null;
        this.infoWindow = null;
        this.infoWindowContent = null;
        this.infoCallBack = null;

        this.lod = new THREE.LOD();

        this.cssRenderer = null;

         

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupRenderer();
        this.setupMapControls();
        this.addResizeListener();
        this.addClickListener();
        this.axis();
        this.setupIndicator();
        this.setupCSSNDRenderer();


        
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
       
    }
   


    setupIndicator(){
        this.selectionIndicator = new SelectionIndicator(this.scene,this.container);
    }


    axis(){
        const axesHelper = new THREE.AxesHelper( 5 );
        this.scene.add( axesHelper );
    } 
    
   
    


    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
    
        if (this.useOrthographicCamera) {
            const frustumSize = 200;
            this.camera = new OrthographicCamera(
                frustumSize * aspect / -2,
                frustumSize * aspect / 2,
                frustumSize / 2,
                frustumSize / -2,
                1,
                1000
            );
        } else {
            this.camera = new PerspectiveCamera(60, aspect, 0.1, 1000);
            //this.camera.position.set(0.3570062481736582, 2.098977770789573, 0.8855386452745455);
            //this.camera.lookAt(0.03575237012985329, -0.8778986564012193, -0.47750991311074553);
            
            
            this.camera.position.set(0, 0, 40);
            this.camera.lookAt(0, 0, 0);
            
            
            
            this.camera.near = 0.1; 
            this.camera.far = 30000; 

         
        }
    
        this.camera.updateProjectionMatrix();
    }

    setupLights(){

                const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
				dirLight1.position.set( 1, 1, 1 );
				this.scene.add( dirLight1 );

				const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
				dirLight2.position.set( - 1, - 1, - 1 );
				this.scene.add( dirLight2 );

				const ambientLight = new THREE.AmbientLight( 0x555555 );
				this.scene.add( ambientLight );
    }


    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    setupCSSNDRenderer(){
        
        this.cssRenderer = new CSS2DRenderer();
        this.cssRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = 0;
        this.cssRenderer.domElement.style.pointerEvents = 'none';

        this.container.appendChild(this.cssRenderer.domElement);
    }

    
    setupControls() {

        
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
      

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.keys = ['KeyA', 'KeyS', 'KeyD'];

        
        /*
        
        this.controls = new MapControls( this.camera, this.renderer.domElement );

			
				this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				this.controls.dampingFactor = 0.05;

				this.controls.screenSpacePanning = true;

				this.controls.minDistance = 0;
				this.controls.maxDistance = 1500;

				this.controls.maxPolarAngle = Math.PI / 2;

        */

    }


    toggleDamping(){
       
            this.controls.enableDamping =  ! this.controls.enableDamping;
        

    }

    setupMapControls() {

        
        this.controls = new MapControls( this.camera, this.renderer.domElement );

			
				this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				this.controls.dampingFactor = 0.08;

				this.controls.screenSpacePanning = true;
                this.controls.zoomSpeed = 1.2;

				this.controls.minDistance = 0;
				this.controls.maxDistance = 1500;

				this.controls.maxPolarAngle = Math.PI / 2;


                this.controls.addEventListener('change', ()=>{


                    this.updateIndicatorPosition();


                });  
                
                this.controls.addEventListener('zoom', function(event) {
                    var currentZoom = event.target.object.position.distanceTo(event.target.target);
                
                    // Adjust zoom speed based on current zoom level
                    if (currentZoom < 100) {
                        controls.zoomSpeed = 1.8; // Adjust this value as needed
                    } else {
                        controls.zoomSpeed = 0.5; // Adjust this value as needed
                    }
                });


        

    }


    updateIndicatorPosition() {
        if (this.selectedObject) {
            // Get selected object's position in world space
            const worldPosition = new THREE.Vector3();
            this.selectedObject.getWorldPosition(worldPosition);
    
            // Convert world space position to screen space coordinates
            const screenPosition = worldPosition.clone().project(this.camera);
    
            // Convert screen space coordinates to pixel values
            const screenWidth = this.container.clientWidth;
            const screenHeight = this.container.clientHeight;
    
            // Calculate the center of the square relative to the screen coordinates
            const squareWidth = 68;
            const squareHeight = 68;
            const squareCenterX = (screenPosition.x + 1) * screenWidth / 2;
            const squareCenterY = (-screenPosition.y + 1) * screenHeight / 2;
    
            // Offset the screen coordinates to center the square
            const screenX = squareCenterX - squareWidth / 2;
            const screenY = squareCenterY - squareHeight / 2;
    
            // Update selection indicator position
            this.selectionIndicator.updatePosition(screenX, screenY);
        }
    }
    
     
    


    addResizeListener() {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.renderer.setSize(width, height);
                this.cssRenderer.setSize(width, height);
                this.camera.aspect = width / height;  // Update this line
                this.camera.updateProjectionMatrix();
                this.repositionInfoWindow(); 
                this.updateIndicatorPosition();  
            }
        });
    
        resizeObserver.observe(this.container);

        

    }


   


    addClickListener() {
        this.container.addEventListener('click', (event) => {
          
            const clickedObject = this.selectObject(event.clientX, event.clientY);
            if (clickedObject) {
                this.handleObjectSelection(clickedObject);
            }else {
                this.unFocus();
            }
        });
    }

    selectObject(clientX, clientY) {
       


        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;


        console.log("x:",x," y:",y);
    
        // Convert 2D mouse coordinates to normalized device coordinates (-1 to 1)
        const mouse = new THREE.Vector2((x / canvas.clientWidth) * 2 - 1, - (y / canvas.clientHeight) * 2 + 1);
    
        // Create a 3D vector representing the mouse in world coordinates
        const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        mouse3D.unproject(this.camera);
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
    
        // Set the raycaster's threshold for point clouds
        raycaster.params.Points.threshold = 0.1;
    
        // Intersect with objects in the scene
        const intersects = raycaster.intersectObjects(this.scene.children, true);
    
        // Return the clicked object, if any
        return intersects.length > 0 ? intersects[0].object : null;
    }

   
    loadGLTFModel(gltfUrl) {
        const loader = new GLTFLoader();
    
        loader.load(gltfUrl, (gltf) => {
            this.scene.add(gltf.scene);
          
        }, undefined, (error) => {
            console.log(error);
        });
    }


    setSkyBox(){
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath( '/front/app/assets/' )
            .load( [
                        'Daylight Box_Back.bmp',
                        'Daylight Box_Front.bmp',
                        'Daylight Box_Top.bmp',
                        'Daylight Box_Bottom.bmp',
                        'Daylight Box_Right.bmp',
                        'Daylight Box_Left.bmp'
                    ] );
    }

    setSkyBoxMty(){

        console.log("SKY BOX DE MONTERREY");
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath( '/front/app/assets/' )
            .load( [
                        'mty_back.png',
                        'mty_front.png',
                        'mty_top.png',
                        'mty_down.png',
                        'mty_right.png',
                        'mty_left.png'
                    ] );
    }


    setSkyBox2(){
        this.scene.background = new HDRCubeTextureLoader()
            .setPath( '/front/app/assets/' )
            .load( [
                        'DH001HC.hdr'
                    ] );
    }
t
    setSkyBox1(){
        var loader = new RGBELoader();
        loader.setDataType(THREE.UnsignedByteType);
        loader.load('/front/app/assets/DH001HC.hdr', function(texture) {
            var pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            var envMap = pmremGenerator.fromEquirectangular(texture).texture;
            this.scene.background = envMap;
            this.scene.environment = envMap;
            pmremGenerator.dispose();
            this.renderer.render(this.scene, this.camera);
        });
    }



    loadGLTFModelc(gltfUrl) {
        const loader = new GLTFLoader();
    
        // Create a DRACOLoader instance
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/front/app/build/jsm/loaders/draco/'); // Set the path to the Draco decoder (where DracoDecoder.js is located)
        loader.setDRACOLoader(dracoLoader); // Provide the DRACOLoader instance to the GLTFLoader
    
        // Load the model
        loader.load(gltfUrl, (gltf) => {
            this.scene.add(gltf.scene);
          
        }, undefined, (error) => {
            console.log(error);
        });
    }

    addGeometry(visualObject) {    
        if(visualObject.isGroup){
            this.objects.set(visualObject.wmesh, visualObject);
            this.objectEntities.set(visualObject.id,visualObject.wmesh);
            this.scene.add(visualObject.mesh);
            this.scene.add(visualObject.wmesh);


        } else {
            this.objects.set(visualObject.mesh, visualObject);
            this.objectEntities.set(visualObject.id,visualObject.mesh );
            this.scene.add(visualObject.mesh);
        }
    }

    

    addLOD(){
        // box geometry
			const box = new THREE.Mesh(
				new THREE.BoxGeometry(5, 5, 5),
				new THREE.MeshBasicMaterial({color: 0xff0000})
			);

			// sphere geometry
			const sphere = new THREE.Mesh(
				new THREE.SphereGeometry(3, 16, 16),
				new THREE.MeshBasicMaterial({color: 0xff0000})
			);

            let gg = new THREE.Group();
           
        

			this.lod.addLevel(sphere, 14);
			this.lod.addLevel(box, 21);

             gg.add(this.lod);


            this.scene.add(gg);


    }


    addLine(o = { x: 0, y: 0, z: 0 }, d = { x: 0, y: 0, z: 0 }) {
        // Create a line along the x-axis
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(o.x, o.y, o.z),
            new THREE.Vector3(d.x, d.y, d.z),
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
    
        // Add the line to the scene
        this.scene.add(line);
    }

    /*
    addLabel(label, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, size = {size:2, height:0.1}, color= 0x000000) {
         
            // Create text geometry
            const textGeometry = new TextGeometry(label, {
                font: this.font,
                size: size.size,
                height: size.height,
            });
    
            // Create a material for the text
            const textMaterial = new THREE.MeshBasicMaterial({ color: color });
    
            // Create a mesh using the text geometry and material
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
            // Position the text
            textMesh.position.set(position.x, position.y, position.z);
    
            // Set the rotation of the text
            textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    
            // Add the text mesh to the scene
            this.scene.add(textMesh);
         
    }
    */

    setBackroundColor(_color){
        this.scene.background = new THREE.Color(_color);
    }
    

    addLabel(label, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, graphics = {size : { size: 2, height: 0.1 }, color : 0x000000, align:false}) {
        // Create text geometry
        const textGeometry = new TextGeometry(label, {
            font: this.font, // Font used for the text
            size: graphics.size.size, // Size of the text
            height: graphics.size.height, // Thickness or extrusion of the text
        });
    
        // Create a material for the text
        const textMaterial = new THREE.MeshBasicMaterial({ color: graphics.color });
    
        // Create a mesh using the text geometry and material
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
        // Calculate the width of the text
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    
        // Position the text : IF no rotation align to right.

        if (graphics.align) {

            textMesh.position.set(position.x , position.y, position.z + textWidth);
            
             
        } else {

            textMesh.position.set(position.x , position.y, position.z);
            
        }
       
    
        // Set the rotation of the text
        textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    
        // Add the text mesh to the scene
        this.scene.add(textMesh);
    }

    add(o){
        this.scene.add(o);
    }
    

    loadOBJ(objUrl, mtlUrl, scale){
        return new Promise((resolve,reject)=>{
            this.loadOBJModel(objUrl, mtlUrl, scale, (model)=>{
                resolve(model);
            })
        });
    }


    loadOBJModel(objUrl, mtlUrl,  scale, _callback = null) {


       
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        
        mtlLoader.load(
            mtlUrl,
            (materials) => {
                materials.preload();

                objLoader.setMaterials(materials);

                objLoader.load(
                    objUrl,
                    (object) => {
                       
                       
                        this.scene.add(object);

                        this.pointToModel(object);


                        if(_callback){
                            _callback(object);
                        }
                      
                      
                    },
                    
                );
            },
           
        );
    }

    pointToModel(model) {
        // Calculate the center of the model's bounding box
        const boundingBox = new THREE.Box3().setFromObject(model);
        const center = boundingBox.getCenter(new THREE.Vector3());
    
        // Assuming `camera` is your THREE.PerspectiveCamera
        const distance = this.calculateDistanceToModel(model); 
        this.camera.position.set(center.x, center.y, center.z + distance);
        this.camera.lookAt(center);
    }

    calculateDistanceToModel(model) {
      
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        return Math.max(size.x, size.y, size.z) * 2; 
    }




    createWireframedPlane(size, divisions) {
        const planeGeometry = new THREE.PlaneGeometry(size, size, divisions, divisions);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to align with the X-Y plane
        this.scene.add(plane);
    
    }


    createGridOfPlanes(n, m, planeSize, color, opacity) {
        const spacing = planeSize * 1.5; // Adjust the spacing between planes

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                const x = i * spacing - (n * spacing) / 2;
                const z = j * spacing - (m * spacing) / 2;
                this.createColoredPlane(planeSize, color, opacity, x, 0, z);
            }
        }
    }

    createColoredPlane(size, color, opacity, x = 0, y = 0, z = 0) {
        const planeGeometry = new THREE.PlaneGeometry(size, size);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(x, y, z);
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to align with the X-Y plane
        this.scene.add(plane);
    }


    createColoredSinglePlane(size, color, opacity) {
        const planeGeometry = new THREE.PlaneGeometry(size, size);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to align with the X-Y plane
        this.scene.add(plane);
    }




    focus(x, y, z, distance) {
        // Set the position of the camera to be at a certain distance from the target point
        this.camera.position.set(x, y, z + distance);

        // Set the camera's look-at point to the target point
        this.camera.lookAt(x, y, z);

        // Update the controls to reflect the new camera position
        //EOO this.controls.target.set(x, y, z);
        this.controls.update();
    }
    
    
    updateSelectionIndicatorPosition(object) {

        this.updateIndicatorPosition();
       
    }


    setupToolBox(toolbox){
        this.container.appendChild(toolbox.getToolboxElement());
    }

    

    
    setupInfoWindow() {



        if (this.infoWindow == null) {
            this.infoWindow = document.createElement('div');
            this.infoWindow.classList.add('info-window');
    
            const header = document.createElement('div');
            header.classList.add('info-window-header');
            this.infoWindow.appendChild(header);
    
            const icon1 = document.createElement('img');
            icon1.src = '/front/app/assets/info.png';
            header.appendChild(icon1);
    
            const closeButton = document.createElement('button');
            closeButton.classList.add('close-btn');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                this.hideInfoWindow();
            });
            header.appendChild(closeButton);
    
            this.infoWindowContent = document.createElement('div');
            this.infoWindowContent.classList.add('info-window-content');
            this.infoWindowContent.innerHTML = 'Info Window content...';
            this.infoWindow.appendChild(this.infoWindowContent);
    
            this.container.appendChild(this.infoWindow);
        }
    
        this.showInfoWindow();
        return this.infoWindow;
               
    }


    setInfoWindow(f){
        this.infoCallBack = f;
    }


    repositionInfoWindow() {
    }
    
     

    hideInfoWindow() {
        if (this.infoWindow) {
            this.infoWindow.style.display = 'none'; // Hide the info window
        }
    }
    
    showInfoWindow() {
        if (this.infoWindow) {
            this.infoWindow.style.display = 'block'; // Show the info window

            if(this.infoCallBack){

                let dID = this.selectedID.split('.');  // divide: domain + id
                this.infoWindowContent.innerHTML = this.infoCallBack(dID[0],dID[1]);

            } else {
                this.infoWindowContent.innerHTML = 'ID:' + this.selectedID;
            }

        }
    }
    

    focusCameraOnObject(object) {

              this.selectedObject = object;

              this.setupInfoWindow();
              this.selectionIndicator.show();
              this.updateSelectionIndicatorPosition(object);
             
    }


    unFocus(){
        this.selectedObject = null;
        this.selectionIndicator.hide();
        this.hideInfoWindow();
    }


    flyCameraToObject(object) {
       
        
        // FLY TO
      
        const targetPosition = new THREE.Vector3(object.position.x+40, object.position.y+40, object.position.z+40);
        const targetLookAt = new THREE.Vector3(object.position.x, object.position.y, object.position.z);
        const duration1 = 2000; // Animation duration in milliseconds
        const duration2 = 2000; 

        const farPosition = new THREE.Vector3(object.position.x+100, object.position.y+50, object.position.z);
        const farLookAt = new THREE.Vector3(0, 0, 0);


        this.controls.update();

        this.flyTo(this.camera.position.clone(),farPosition, farLookAt, duration1,()=>{



           
           

            this.flyTo(this.camera.position.clone(), targetPosition, targetLookAt, duration2,()=>{

                this.controls.target = targetLookAt;
                this.controls.update();
                this.focusCameraOnObject(object);
            });



        });

         

       
      
       
      
       

    }


    flyTo(initPosition, targetPosition, targetLookAt, duration, callback) {

        
        
            const startPosition = initPosition;
            //const startLookAt = new THREE.Vector3().copy(targetLookAt);
            const startLookAt = this.camera.getWorldDirection(new THREE.Vector3()).clone();

            const camera = this.camera;
            const scene = this.scene;
            const renderer = this.renderer;
    
            const startTime = Date.now();
            const endTime = startTime + duration;
    
            function updateCamera() {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);
        
                // Interpolate camera position
                const newPosition = startPosition.clone().lerp(targetPosition, progress);
                camera.position.copy(newPosition);
        
                // Interpolate camera look-at target
                const newLookAt = startLookAt.clone().lerp(targetLookAt, progress);
                camera.lookAt(newLookAt);
        
                // Render the scene
                renderer.render(scene, camera);
        
                // Check if the animation is still in progress
                if (progress < 1) {
                    requestAnimationFrame(updateCamera);
                } else if (callback) {
                    // Call the callback function when the animation completes
                    callback();
                }
            }
    
            // Start the animation
            updateCamera();
        
    }
    
    





    handleObjectSelectedOutside(domain, event, payload){
        console.log('Objeto seleccionado afuera', domain, payload);

        let id=domain+'.'+payload.id;  

        if(this.selectedCustomObject.domain == domain && this.selectedCustomObject.id == payload.id)
        {
            // el objeto ya estaba seleccionado
        }else{


            this.selectedCustomObject = {domain:domain,id:payload.id}; 

            this.selectedID = id;

            let o = this.objectEntities.get(id);
    
            this.unFocus();
    
            this.flyCameraToObject(o);


        }

       

         
        //this.focusCameraOnObject(o);

    }


    flyToEntity(e){

        let o = this.objectEntities.get(e);

        this.unFocus();

        this.flyCameraToObject(o);
    
    }



    addObject(domain, event, newObject) {


    }

    updateObject(domain, event, newObject){

    }

    removeObject(domain, event, newObject){

    }

    handleObjectSelection(object) {
       
        const customObject = this.objects.get(object);
        if (customObject) {
            console.log('Selected custom object ID:', customObject.id);

            this.selectedID = customObject.id;
            this.selectedObject = object;
            
           
            let domain = customObject.id.split(".")[0];
            let id = customObject.id.split(".")[1];

            this.selectedCustomObject = {domain:domain,id:id};
            this.controller.triggerObjectSelected(domain, {id:id});


            this.focusCameraOnObject(object);
            
        } else {
            this.unFocus();
            

    }

    }









    animate() {
        requestAnimationFrame(() => this.animate());

       // console.log('Camera Position:', this.camera.position);
       // console.log('Camera Direction:', this.camera.getWorldDirection(new THREE.Vector3()));
        if(this.controls.getDistance()<2){

            var currentLookAt = this.camera.getWorldDirection(new THREE.Vector3()).clone();
            this.controls.target.add(currentLookAt.multiplyScalar(0.4));
        }   
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }









}


