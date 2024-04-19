/*


    vi_element
    Representa un elemento dentro de un slot en un tablero


*/


export class vi_element {

    constructor(path, id, visual_object, object, slot, parent_element = null){
       
        this.path = path;
        this.id = id;
        this.visual_object = visual_object;
        this.object = object;
        this.slot = slot;
        this.parent = parent_element;
    }


    getPosition(){
        return this.visual_object.getPosition();
    }

}