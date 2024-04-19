import {vi_dimension}  from './vi_dimension.js';

export class vi_segment{




    // {dimension:this.name, label:data[this.name], position:this.position}
    constructor(segment_data){
        
        this.board = segment_data.board;
        this.name =segment_data.segmentname;
        this.label=segment_data.label;
        this.dimension = segment_data.dimension;
        this.dimension_ptr = segment_data.dimension_ptr;   // Pointer a la dimension
        this.position = segment_data.position;
        this.axis = segment_data.axis;
        this.counter = 0; // Numero de elementos que han caido en este segmento
        this.dimensions_def = segment_data.dimensions_def;
        this.data = segment_data.data;
        this.dimensions = [];
        this.hasLabel = false;
        

        this.dimensions_def.forEach(dimension => {
            
            var dim = new vi_dimension(dimension, this.board, this.dimension_ptr, this);
             
            this.dimensions.push(dim);


        });
    
    }


    addData(data){


        var segments = [];

        // Checa data para cada dimension :
        this.dimensions.forEach((dimension)=>{

            var subsegments = dimension.getSegments(data,[],'');
            subsegments.forEach((ss)=>{
                segments.push(ss);
            })

        });

       

        return segments;

    }

    

}