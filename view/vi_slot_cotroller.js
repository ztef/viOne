import { vi_element } from "./vi_element.js";
import { vi_geometry_factory } from "./vi_geometry_factory.js";
import { vi_slot } from "./vi_slot.js";



export class vi_slot_controller {

    constructor(board,render){
        this.render = render;
        this.board = board;
        this.graphics = {};
        this.axis = 'y';
        this.delta = 3;
        this.slots = new Map();
        this.elements = new Map();  // Todos los elementos sin importar el slot
        this.geometry_factory = new vi_geometry_factory();
        
    }

    setDelta(_d){
        this.delta = _d;
    }

    setDirection(direction){

        if(direction == 'up'){
            this.axis = 'y';
        }
        if(direction == 'out'){
            this.axis = 'z';
        }
        
    }

    getElementFromSlot(s,e){

        var slot = null;
        var element = null;

        if(this.slots.has(s)){

            slot = this.slots.get(s);
            element = slot.getElement(e);

        }

        return element;

    }


    // agrega un elemento a un slot, si el slot no existe lo crea previamente.

    //addSlotElement2Board()
    addObject2Slot(path, id, object, hg = null){   // hipergeometria = null


        var slot;

        // Si no existe el slot lo crea :

        if (!this.slots.has(path)) {


            let board = this.board.getBoard(path);
            let point = this.board.locatePointByPath(path);
            let angle = board.getAngleForPoint(point);

            slot = new vi_slot(point, this.delta, this.axis, angle);
            this.slots.set(path, slot );
           
          
          } else {
           
            slot = this.slots.get(path);
          
        }

        
        const _point = slot.getTopPoint(this.axis);
        

        var vo;   // visual object

        if(hg == null){
        
                var color = 0x00ff00;

                var g = this.geometry_factory.createGeometry('Sphere',[1,10, 10]);
                var m = this.geometry_factory.createObject(g,{x:_point.x,y:_point.y,z:_point.z}, { color: color,transparent: false, opacity: 0.5, side: THREE.DoubleSide });
                vo = this.geometry_factory.createVisualObject(m,id);

        } else {
            vo = hg;
            vo.setPosition({x:_point.x,y:_point.y,z:_point.z});
            vo.id = id;
        }


        this.render.addGeometry(vo); 
        const element = new vi_element(path, id, vo, object, slot);
        slot.addElement(id, element);  // agrega el elemento al slot
        this.elements.set(id,element);  // agrega el elemento al mapa de elementos


        


    }


    // Agrega un slot a un elemento :
    addSlot2Element(s,e,id, object, geom = null){
        let slot_element = this.getElementFromSlot(s,e);

   
        if(slot_element){

            var slot;
            if (!this.slots.has(e)) {

                let point = slot_element.getPosition();
                let angle = 0;
    
                slot = new vi_slot(point, 2, 'y', 0);
                this.slots.set(e, slot );
               
              
              } else {
               
                slot = this.slots.get(e);
              
            }


            const _point = slot.getTopPoint('y');
        

            var vo;   // visual object
    
            if(geom == null){
            
                    var color = 0xff0000;
    
                    var g = this.geometry_factory.createGeometry('Sphere',[0.3,10, 10]);
                    var m = this.geometry_factory.createObject(g,{x:_point.x,y:_point.y,z:_point.z}, { color: color,transparent: false, opacity: 0.5, side: THREE.DoubleSide });
                    vo = this.geometry_factory.createVisualObject(m,id);
    
            } else {
                vo = geom;
                vo.setPosition({x:_point.x,y:_point.y,z:_point.z});
                vo.id = id;
            }
    
    
            this.render.addGeometry(vo); 

            //slot_element lo agrega como padre
            
            const element = new vi_element(e, id, vo, object, slot, slot_element);
            slot.addElement(id, element);
            this.elements.set(id,element); // Agrega al mapa global de elementos
    

        } else {
            console.log('No Slot');
        }

    }


    addSlot2Position(){

    }


    acceptVisitor(visitor) {
        this.slots.forEach(slot => {
            slot.elements.forEach(element =>{
                visitor(element);
            });          
        });
    }

    acceptVisitorToElements(visitor) {
        this.elements.forEach(element => {
             
                visitor(element);
                     
        });
    }



}