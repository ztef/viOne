
import {vi_dimension}  from './vi_dimension.js';
import { vi_geometry_factory } from './vi_geometry_factory.js';
import { vi_HiperBoard } from './vi_hiperboard.js';

export class vi_abstractBoard {



    constructor(name, board_config, render_engine){
       
        this.name = name;
        this.render_engine = render_engine;
        this.dimensions = [];
        this.config = board_config;

        this.geometry_factory = new vi_geometry_factory();

        

        board_config.dimensions.forEach(dimension => {
            
                var dim = new vi_dimension(dimension, this, null, null);   // config, board, parent null == root
                this.addDimension(dim);

          });

          

         


        
    }


    addDimension(dim){
      
            this.dimensions.push(dim);
            
    }



   drawold(dimension){
    
      
           // this.drawLINE(dimension);

        var amplitude = 20;
       
        const centro = {x:0, y:0};



           const hiperCircle = new vi_HiperCircle(amplitude, 0, centro);

           // Set the total segments for the board
           //hiperBoard.setTotalMarkers(nummarkers);
           
           hiperCircle.setLevels([3,4,2]);
           


           var pos =centro;
           var color = 0x00ff00;

           var g = this.geometry_factory.createGeometry('Circle',[amplitude,64]);
           var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: true, opacity: 0.5 });
           var o = this.geometry_factory.createVisualObject(m,'hb');
       
           this.render_engine.addGeometry(o); 




           var points = hiperCircle.getSegments(0);
           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0xff0000;

            var g = this.geometry_factory.createGeometry('Circle',[3,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });




           var points = hiperCircle.getSegments(1);
           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0x0000FF;

            var g = this.geometry_factory.createGeometry('Circle',[2,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });

            

           var points = hiperCircle.getSegments(2);
           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0x000000;

            var g = this.geometry_factory.createGeometry('Circle',[1,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });






           const levelToDraw = 0;
           const lineLength = 150;

           var lines = hiperCircle.calculateLinesForLevel(levelToDraw ,150);
           lines.forEach((line)=>{

            this.render_engine.addLine(line.start,{ x: line.end.x, y: line.end.y, z: 0 });

           });




           let p = hiperCircle.locatePointByPath('1.1.0');

           pos.x = p.x;
           pos.y = p.y;
           pos.z = 0;

           color = 0x00ff00;

           var g = this.geometry_factory.createGeometry('Circle',[1,16]);
           var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
           var o = this.geometry_factory.createVisualObject(m,'hbp');

           this.render_engine.addGeometry(o); 








           // HIPERLINE 


           const lineOrigin = { x: 0, y: -50, z: 0 };
           const lineAngle = Math.PI / 4; // 45 degrees in radians
           const linelength = 500;
           const levelsArray = [10, 5, 4];

           const hiperLine = new vi_HiperLine(lineOrigin, 0, linelength);
           hiperLine.setLevels(levelsArray);

            // Calculate points for a specific level (e.g., level 1)
           
           
           var points = hiperLine.getSegments(0);

           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0xff0000;

            var g = this.geometry_factory.createGeometry('Circle',[3,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });

           
           var points = hiperLine.getSegments(1);

           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0x0000ff;

            var g = this.geometry_factory.createGeometry('Circle',[3,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });

           var points = hiperLine.getSegments(2);

           points.forEach((point)=>{

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;

            color = 0x000000;

            var g = this.geometry_factory.createGeometry('Circle',[1,16]);
            var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
            var o = this.geometry_factory.createVisualObject(m,'hbp');

            this.render_engine.addGeometry(o); 

           });

          
           const point = hiperLine.locatePointByPath('1.1.0');

           pos.x = point.x;
           pos.y = point.y;
           pos.z = 0;

           color = 0x00ff00;

           var g = this.geometry_factory.createGeometry('Circle',[1,16]);
           var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: color,transparent: false, opacity: 0.5 });
           var o = this.geometry_factory.createVisualObject(m,'hbp');

           this.render_engine.addGeometry(o); 
           
            
     
    
   }


   draw(dimension){


        var conf = {
            board:{

                type:"radial",
                origin: {x:0, y:0, z:0},
                amplitude: 50,
                angle:0,
                levels: [3,2],
                graphics:{
                    center:{amplitude:30, color:0x00ff00, transparent:true, opacity:0.5 }
                },
                content:
                {
                    board:{
                        type:"linear",
                        origin: {x:0,y:0,z:0},
                        amplitude: 100,
                        angle: 0,
                        levels:[10],
                        graphics:{
                            line:{color:0x00ff00, transparent:true, opacity:0.5}
                        },
                        content:{

                            board:{
                                type:"linear",
                                origin: {x:0,y:0,z:0},
                                amplitude: 20,
                                angle: 0,
                                levels:[2],
                                graphics:{
                                    line:{color:0x00ff00, transparent:true, opacity:0.5}
                                },
                                content:{
                                }
                            }

                        }
                    }
                }

            }
        }


        var conf1 = {
            

               
                    board:{
                        type:"linear",
                        origin: {x:0,y:0,z:0},
                        amplitude: 100,
                        angle: 0,
                        levels:[10,2],
                        graphics:{
                            line:{color:0x00ff00, transparent:true, opacity:0.5}
                        },
                        content:{

                            board:{
                                type:"linear",
                                origin: {x:0,y:0,z:0},
                                amplitude: 20,
                                angle: 0,
                                levels:[5],
                                graphics:{
                                    line:{color:0x00ff00, transparent:true, opacity:0.5}
                                },
                                content:{
                                }
                            }

                        }
                    }
                

            
        }


        var hb = new vi_HiperBoard(this.render_engine);
        hb.addBoard(conf1);
        hb.draw();

        hb.setLabel('1.0', 'Valor 0');


       
       // this.render_engine.addLabel("SI JALA",{x:0,y:0,z:0, color:0x0088ff},rotate,{size:3, height:0.3});







   }


   drawok(dim){



         var origin = {x:0, y:0, z:0, color:0};
     
                if(dim.parent){   // Si dim.parent es un segmento usa la posicion del segmento
                        origin[dim.axis] =  dim.parent.position;
                }

    
       // Crea Markers :

            
           for(var i=0; i < dim.estimated_segments; i ++){


               var magnitude = dim.value0 + dim.delta * i;
               var axis = dim.axis;
               var pos = {x:origin.x, y:origin.y, z:origin.z, color:0x0088ff};

               if(dim.offset){
                    pos = this.addV(pos, dim.offset);                                                        
               }


               pos[axis] = pos[axis] + magnitude;
               var id = dim.name + origin.x +'_' + i;


               var g = this.geometry_factory.createGeometry('Plane',[5,10,1,1]);

               // color: color, transparent: true, opacity: opacity }  0x0088ff, 0.5
               var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: pos.color, transparent: true, opacity: 0.5  });
               var o = this.geometry_factory.createVisualObject(m,id);
               
               this.render_engine.addGeometry(o);

           }
       



       // LABELS

        


               if(dim.label){



                   var pos = {x:origin.x, y:origin.y, z:origin.z, color:0x0088ff};

                   if(dim.offset){
                      pos = this.addV(pos, dim.offset);                                                        
                   }

                   pos[dim.axis] = pos[dim.axis] + dim.value0;


                   
                   var rotate = {x:0, y:0, z:0};

                   if(dim.axis == 'x'){
                       pos =  this.addV(pos, {x:0, y:-5, z:0});
                   }

                   if(dim.axis == 'y'){
                       pos =  this.addV(pos, {x:-5, y:0, z:0});
                       rotate = {x:0, y:0, z:3.1415/2};
                   }

                   if(dim.axis == 'z'){
                       pos =  this.addV(pos, {x:-5, y:-10, z:0});
                       rotate = {x:0, y:3.1415/2, z:0};
                   }

                   if(dim.axis != 'color'){
                       this.render_engine.addLabel(dim.label,pos,rotate,{size:3, height:0.3});
                   }


               
               }

       



       // EJE
 

              var pos = {x:origin.x, y:origin.y, z:origin.z, color:0x0088ff};

               if(dim.offset){
                   pos = this.addV(pos, dim.offset);                                                        
               }

               pos[dim.axis] = pos[dim.axis] + dim.value0;


               var line_lenght = dim.estimated_segments * dim.delta;


               if(dim.axis == 'x'){
                   this.render_engine.addLine(pos, this.addV(pos, { x: line_lenght, y: 0, z: 0 })) 
               }
               if(dim.axis == 'y'){
                   this.render_engine.addLine(pos, this.addV(pos, { x: 0, y: line_lenght, z: 0 })) 
               }
               if(dim.axis == 'z'){
                   this.render_engine.addLine(pos, this.addV(pos, { x: 0, y: 0, z: line_lenght })) 
               }

      
    }

    

    addV(vector1, vector2) {
        return {
            x: vector1.x + vector2.x,
            y: vector1.y + vector2.y,
            z: vector1.z + vector2.z,
            color: vector1.color
        };
    }




    addElement(data){

        var segments = [];

        // Obtiene los segmentos en los que cae , en cada dimension

        this.dimensions.forEach((dimension)=>{

            var segs = dimension.getSegments(data,[],'');
            segs.forEach((s)=>{
                segments.push(s);

            });


        });


        // Obtiene la posicion que corresponde de acuerdo a los segmentos en que cae

        var pos = {x:0, y:0, z:0, color:0};



        segments.forEach((segment)=>{


                    if(segment.dimension_ptr.offset){
                        pos = this.addV(pos, segment.dimension_ptr.offset);  
                    }

               
                    // calcula posicion del elemento
                    pos[segment.axis] = pos[segment.axis] + segment.position;
                  
        });

    

        // Resuelve LABELS

        if(true){

                    segments.forEach((segment)=>{ 
                        

                        if(segment.axis != "color" && segment.dimension_ptr.segmentLabel && !segment.hasLabel){


                            var posit =  {x:pos.x, y:0, z:0};


                           



                            var rotate = {x:0, y:0, z:0};
                            var counterpart = '';

                            if(segment.axis == 'x'){
                                rotate.z = 3.1415/2;      // corre hacia y
                                counterpart = 'y';
                            } 


                            if(segment.axis == 'y'){
                                counterpart = 'x';
                            }

                            if(segment.axis == 'z'){
                                counterpart = 'x';
                            }



                            var root_segment = (segment.dimension_ptr.parent == null); // true si es un root segment

                            if(root_segment){
                                    posit[counterpart] = -5;            // posicion absoluta
                            } else {

                                                                        // posicion relativa

                                var parent_axis = segment.dimension_ptr.parent_dim.axis;
                                posit[segment.axis] = pos[segment.axis];
                                posit[counterpart] = 10;         

                            }


                            if(segment.dimension_ptr.offset){
                                posit = this.addV(posit, segment.dimension_ptr.offset);  
                            }

                            this.render_engine.addLabel(segment.name,posit,rotate,{size:1, height:0.1});


                            segment.hasLabel = true;
                        }
                        


                    });
   
        }
 

        // CONVIERTE A COORDENADAS POLARES :

        if (this.config.boardType == "polar"){

            pos.x = pos.y * Math.sin((pos.x * Math.PI )/ 180);
            pos.y = pos.y * Math.cos((pos.x * Math.PI)/  180);

        }


        // Dibuja el elemento


        var g = this.geometry_factory.createGeometry('Sphere',[2,10,10]);
        var m = this.geometry_factory.createObject(g,{x:pos.x,y:pos.y,z:pos.z}, { color: pos.color });
        var o = this.geometry_factory.createVisualObject(m,data.id);
          
        this.render_engine.addGeometry(o);
    
    };


     



}