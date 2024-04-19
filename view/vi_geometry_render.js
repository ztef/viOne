import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
//import { OBJLoader2 } from 'three/addons/loaders/OBJLoader2.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class CustomGeometryRenderer {
    constructor(containerId, customGeometry) {
        this.container = document.getElementById(containerId);
        this.customGeometry = customGeometry;
        this.init();
        this.animate();
        this.objects = new Map();
    }

    init() {

       
        const aspect = this.container.clientWidth / this.container.clientHeight;

        this.perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
        this.perspectiveCamera.position.z = 500;

        this.orthographicCamera = new THREE.OrthographicCamera(
            this.customGeometry.radius * 2 * aspect / -2,
            this.customGeometry.radius * 2 * aspect / 2,
            this.customGeometry.radius,
            this.customGeometry.radius / -2,
            1,
            1000
        );
        this.orthographicCamera.position.z = 500;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const circle = new THREE.Mesh(this.customGeometry, material);

        this.scene.add(circle);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.controls = new TrackballControls(this.perspectiveCamera, this.renderer.domElement);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.keys = ['KeyA', 'KeyS', 'KeyD'];

        window.addEventListener('resize', () => this.onWindowResize());


        const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // The 'entry' object contains information about the element's new size
          const { width, height } = entry.contentRect;

          // Handle the size changes here
          console.log(`New width: ${width}px, New height: ${height}px`);
          
          // You can update your rendering or perform other actions here
          // For example, update your WebGL renderer's size if needed
          this.renderer.setSize(width, height);
        }
        });


        resizeObserver.observe(this.container);


        this.container.addEventListener('click', (event) => {
            const canvas = event.target;
            const rect = canvas.getBoundingClientRect();
        
            // Calculate the mouse coordinates relative to the canvas
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
        
            // Convert 2D mouse coordinates to 3D world coordinates
            const mouse = new THREE.Vector2((x / canvas.clientWidth) * 2 - 1, - (y / canvas.clientHeight) * 2 + 1);
        
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.perspectiveCamera);
        
            // Check for intersections with your geometries
            const intersects = raycaster.intersectObjects(this.scene.children, true);
        
            if (intersects.length > 0) {
                // The first object in the intersections array is the one that was clicked
                const clickedObject = intersects[0].object;

                const object = this.objects.get(clickedObject);

                if (object !== undefined) {
                    // Handle the selection or interaction with the clicked object using its ID
                    console.log('Clicked object ID:', object.id);
                }
        
                
            }
        });
        
    

         


    }

    onWindowResize() {
        const aspect = this.container.clientWidth / this.container.clientHeight;

        this.perspectiveCamera.aspect = aspect;
        this.perspectiveCamera.updateProjectionMatrix();

        this.orthographicCamera.left = this.customGeometry.radius * 2 * aspect / -2;
        this.orthographicCamera.right = this.customGeometry.radius * 2 * aspect / 2;
        this.orthographicCamera.top = this.customGeometry.radius;
        this.orthographicCamera.bottom = this.customGeometry.radius / -2;
        this.orthographicCamera.updateProjectionMatrix();

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.controls.handleResize();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.controls.update();
        this.renderer.render(this.scene, this.perspectiveCamera);
    }



    addVisualObject(visualObject) {    
        this.objects.set(visualObject.mesh, visualObject);
        this.scene.add(visualObject.mesh);
    }

    addObject(newObject){
        this.scene.add(newObject);
    }


    addOBJModel(objUrl, mtlUrl,  scale) {


        const position = new THREE.Vector3(0, 0, 0);
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
                        object.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // Apply any custom material or color to the loaded object here
                               //child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                               child.material = materials.create(child.material.name);
                            }
                        });

                        // Set the position and scale for the loaded object
                        //object.position.copy(position);
                        //object.scale.set(scale, scale, scale);

                        // Add the loaded object to the scene
                        this.scene.add(object);

                        // Trigger the onLoad callback if provided
                      
                    },
                    
                );
            },
           
        );
    }



    addGLTFModel(gltfUrl, scale) {
        const loader = new GLTFLoader();
    
        loader.load(gltfUrl, (gltf) => {
            this.scene.add(gltf.scene); // Use the 'this' keyword to refer to the class instance
        }, undefined, (error) => {
            console.log(error);
        });
    }

}