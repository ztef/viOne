import {vi_segment}  from './vi_segment.js';

export class vi_dimension {

    constructor(config, board, parent_dim, parent){
       
        this.type = config.type;
        this.name = config.name;
        this.parent = parent;
        this.board = board;
        this.parent_dim = parent_dim;                         // Dimension padre
        this.label = config.label;
        this.segmentLabel = config.segmentLabel;
        this.axis = config.axis;                      // eje
        this.delta = config.delta;                    // delta o incremente entre segmentos
        this.value0 = config.value0;
        this.position = config.value0;                // valor actual de la posicion
        this.map = config.map;
        this.estimated_segments = config.segments;    // segmentos esperados
        this.dimensions_def = [];                     // SUBDIMENSIONES
        this.numsegments = 0;                         // numero de segmentos
        this.config = config;
        this.offset = config.offset;
        

        if(this.parent){

            if(this.axis == this.parent_dim.axis){
             this.value0 = this.parent.position;
             this.position = this.value0;
            }
        }




        console.log('dimension ', this.name, 'creada');



        if(config.dimensions){

            config.dimensions.forEach((dimension_config) => {
                   
                this.dimensions_def.push(dimension_config);

            });


        }


        this.segments = {};

        this.draw();

        
    }


    draw(){
         
            this.board.draw(this);
        
    }


    getSegments(data){



        var segment;

        var segmentname =  data[this.name];

       


        // Si ya existe el segmento en esta dimension :
        if (this.segments.hasOwnProperty(segmentname))
        {
            
            segment = this.segments[segmentname];
             

        } else {


            // Si no existe el segmento
            
            // crea el segmento :
            segment = new vi_segment({dimension:this.name, dimension_ptr:this, segmentname:segmentname, label:data[this.name], axis:this.axis, position:this.position, segments:this.estimated_segments, dimensions_def:this.dimensions_def, data:data, map:this.map, board:this.board});
        
            // incrementa el numero de segmentos en esta dimensionthis.
            this.numsegments = this.numsegments + 1;

            // incrementa el valor de la posicion del segmento dentro de la dimension

            if(this.map){
                this.position = this.map[data[this.name]];
                segment.position = this.position;
            } else {
                this.position =  this.value0 + this.numsegments * this.delta;
            }
           
            
           

            this.segments[segmentname] = segment; 
            

        }



        var subsegments = segment.addData(data);
        segment.counter = segment.counter + 1;

        var segments = [];
        segments.push(segment);

        subsegments.forEach((subs)=>{
            segments.push(subs);       
        });


        return segments;

    }

    

    



    



}