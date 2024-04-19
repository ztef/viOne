import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class vi_circlepack {

    constructor(div_id){


      
     this.div = document.getElementById(div_id);   

        // Configuration variables
      this.marginTop = 50;
      this.marginRight = 10;
      this.marginBottom = 10;
      this.marginLeft = 60;
      
      this.svgStyle = "max-width: 100%; height: auto; user-select: none;";
      this.dx = 40; // Assuming dx is predefined
      this.circle_radius = 10;
      this._color_node = "#555";
      
      this.width = this.div.clientWidth;
      this.height = this.div.clientHeight;
      
      this.font = "15px sans-serif";
      this._color_back = 0x000000;
      this._color_leaf = "#999";
       
         
    }

    _onMouseOver(name, value) {
        // Check if tooltip already exists
        let tooltip = document.querySelector('.xtooltip');
        
        // If tooltip doesn't exist, create it
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'xtooltip';
            this.div.appendChild(tooltip);
        }
    
        // Update tooltip content
        tooltip.innerHTML = `<strong style="color: white">${name}:</strong> ${value}`;
    
        // Position tooltip relative to mouse pointer
        const event = d3.event || window.event;
        const mouseX = event.pageX || event.clientX + document.body.scrollLeft;
        const mouseY = event.pageY || event.clientY + document.body.scrollTop;
        tooltip.style.left = (mouseX + 10) + 'px';
        tooltip.style.top = (mouseY + 10) + 'px';
    }
    
    
    _onMouseOut() {
        // Remove tooltip element when mouse moves out
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }
      
    _onClick(name){
        console.log("CALLBACK",name);
    }
      
      
    draw(data){   

      
      // Create the color scale.
      const color = d3.scaleLinear()
          .domain([0, 5])
          .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
          .interpolate(d3.interpolateHcl);
      
      // Compute the layout.
      const pack = data => d3.pack()
          .size([this.width, this.height])
          .padding(30)
        (d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value));
      this.root = pack(data);
      
      // Create the SVG container.
      this.svg = d3.create("svg")
          .attr("viewBox", `-${this.width / 2} -${this.height / 2} ${this.width} ${this.height}`)
          .attr("width", this.width)
          .attr("height", this.height)
          .attr("style", `max-width: 100%; height: auto; display: block; margin: 0 -14px; background: ${this._color_back}; cursor: pointer;`);
      
      // Append the nodes.
      this.node = this.svg.append("g")
        .selectAll("circle")
        .data(this.root.descendants().slice(1))
        .join("circle")
          .attr("fill", d => d.children ? color(d.depth) : this._color_leaf)
          .attr("stroke", "black") // Add stroke color here
          .attr("stroke-width", 1) // Adjust stroke width as needed
          .attr("pointer-events", d => !d.children ? "all" : null)
          .on("mouseover",  (event,d) => { 
              const circle = event.target;
              d3.select(circle).attr("stroke", "red");
              this._onMouseOver(d.data.name, d.data.value);
           })
          .on("mouseout", function() { d3.select(this).attr("stroke", "black"); })
          .on("click", (event, d) => {
            if (!d.children) {
              // Handle click on leaf node (e.g., display information, without zooming out)
              console.log("Clicked on a leaf node:", d.data.name);
              this._onClick(d.data.name);
              event.stopPropagation(); 
            } else {
              console.log("CLICK",d );
              // Handle click on non-leaf node (e.g., zoom in/out behavior)
              this.focus !== d && (this.zoom(event, d), event.stopPropagation());
            }
      
            
          });
      
      // Append the text labels.
      this.label = this.svg.append("g")
          .style("font", this.font)
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
        .selectAll("text")
        .data(this.root.descendants())
        .join("text")
        .style("fill-opacity", d => (this.focus && (d.depth === this.focus.depth || d.depth === this.focus.depth + 1)) ? 1 : 0)
        .style("display", d => (d.parent === this.root || (d.parent && d.parent.parent === this.root)) ? "inline" : "none") 
         .text(d => d.data.name + ' ' + d.data.value);
      
      // Create the zoom behavior and zoom immediately in to the initial focus node.
      this.svg.on("click", (event) => this.zoom(event, this.root));
      this.focus = this.root;
      let view;
      this.zoomTo([this.focus.x, this.focus.y, this.focus.r * 2]);


      this.div.appendChild(this.svg.node());

    }
      
    zoomTo(v) {
        const k = this.width / v[2];
      
        const yOffset = 15;

        this.view = v;

        // Adjust the y-coordinate for label positioning
        this.label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1] - d.r + yOffset) * k})`);
        this.node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
         this.node.attr("r", d => d.r * k);

      //  this.label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      //  this.node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      //  this.node.attr("r", d => d.r * k);
    }
      


    zoom(event, d) {
        const focus0 = this.focus;
        this.focus = d;
    
        const transition = this.svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(this.view, [this.focus.x, this.focus.y, this.focus.r * 2]);
                return t => this.zoomTo(i(t));
            });
    
        const self = this; // Store reference to 'this'
    
        this.label
            .filter(function(d) { 
                return d.parent === self.focus || this.style.display === "inline"; // 'this' refers to the DOM element here
            })
            .transition(transition)
            .style("fill-opacity", d => d.parent === self.focus ? 1 : 0)
            .on("start", function(d) { 
                if (d.parent === self.focus) {
                    this.style.display = "inline"; // 'this' refers to the DOM element here
                }
            })
            .on("end", function(d) { 
                if (d.parent !== self.focus) {
                    this.style.display = "none"; // 'this' refers to the DOM element here
                }
            });
    }
    
      
       
     
      
        
      

}