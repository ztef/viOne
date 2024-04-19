/*

  VISUAL INTERACTION SYSTEMS

  Objeto BASE


*/


class vi_Object {
    constructor(id, collection, data) {
      

        this.id = id;
        this.collection = collection;
        this.data = data;
       
        }

}

vi_Object.prototype.getFormatedData = function() {
    return(`ID : ${this.id} Collection ${this.collection} .`);
  };

export default vi_Object;



