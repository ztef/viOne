export class vi_visualObject {

    constructor(mesh, id){
        this.mesh = mesh;
        this.id = id;
        this.isGroup = false;
        this.wmesh = null;      // Wrapper mesh no es necesaria en geometrias simples
    }

    setWrapper(wmesh){
        this.wmesh = wmesh;         // establece un wrapper mesh transparente para gometrias complejas
        this.isGroup = true;        
    }

    setPosition(p){
        this.mesh.position.set(p.x,p.y,p.z);
        if(this.isGroup){
            this.wmesh.position.set(p.x,p.y,p.z);
        }
    }

    getPosition(){
        return {x:this.mesh.position.x, y:this.mesh.position.y, z:this.mesh.position.z}
    }


}