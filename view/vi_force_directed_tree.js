import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class vi_force_directed_tree {
    constructor(data, outerDivId, controller, domain) {



        this.controller = controller;
        this.domain = domain;
        this.data = data;
        
        this.data = data;
        this.outerDivId = outerDivId;

        // Get the outer div
        const outerDiv = document.getElementById(this.outerDivId);

        // Create the inner div
        this.innerDiv = document.createElement("div");
        this.innerDiv.style.width = "100%";
        this.innerDiv.style.height = "100%";
        this.innerDiv.style.position = "relative"; // Ensuring relative positioning for inner div
        outerDiv.appendChild(this.innerDiv);


        this.updateDimensions();
        this.createForceDirectedTree();

        // Create a ResizeObserver
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        const div = document.getElementById(this.outerDivId);
        this.resizeObserver.observe(div);
    }

    updateDimensions() {
        const div = this.innerDiv;
        this.width = div.clientWidth;
        this.height = div.clientHeight;
    }

    handleResize() {
        // Update the dimensions and recreate the force-directed tree
        this.updateDimensions();
        this.createForceDirectedTree();
    }

    handleNodeClick(object) {

        
  
        this.controller.triggerObjectSelected(object.type, { id: object.id });
    
    }

    /*
    createForceDirectedTree() {
        const root = d3.hierarchy(this.data);
        const links = root.links();
        const nodes = root.descendants();

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(1))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.create("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .attr("style", "max-width: 100%; height: auto;")
            .call(d3.zoom().scaleExtent([0.1, 10]).on("zoom", () => {
                node.attr("transform", d3.event.transform);
                link.attr("transform", d3.event.transform);
            }));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line");

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(this.drag(simulation));

        node.append("circle")
            .attr("fill", d => d.children ? "#3182bd" : "#c6dbef")
            .attr("r", d => d === root ? 10 : 7);

        // Append icons as images
        node.append("image")
            .attr("xlink:href", d => d.data.icon) // Set the icon dynamically based on the data
            .attr("x", -12)
            .attr("y", -12)
            .attr("width", 24)
            .attr("height", 24);

        node.append("title")
            .text(d => d.data.name);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Append the SVG to the specified div
        const div = document.getElementById(this.divId);
        div.appendChild(svg.node());
    }
    */

    createForceDirectedTree() {
        const root = d3.hierarchy(this.data);
        const links = root.links();
        const nodes = root.descendants();
    
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(1))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("x", d3.forceX())
            .force("y", d3.forceY());
    
        const svg = d3.create("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .attr("style", "max-width: 100%; height: auto;");
    
        const zoomContainer = svg.append("g")
            .attr("class", "zoom-container");
    
        const link = zoomContainer.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line");
    
        const node = zoomContainer.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(this.drag(simulation));
    
        node.each(function(d) {
                if (d.data.icon) {
                    d3.select(this)
                        .append("image")
                        .attr("href", d.data.icon)
                        .attr("x", -8) // Adjust the position of the icon within the node
                        .attr("y", -8) // Adjust the position of the icon within the node
                        .attr("width", 16) // Adjust the size of the icon
                        .attr("height", 16); // Adjust the size of the icon
                } else {
                    d3.select(this)
                        .append("circle")
                        .attr("fill", d => d.children ? "#3182bd" : "#c6dbef")
                        .attr("r", d => d === root ? 10 : 7);
                }
            });

        node.append("title")
            .text(d => d.data.name);



        // Add right-click listener for nodes
        node.on("contextmenu", (event, d) => {
            event.preventDefault(); // Prevent default browser context menu
            this.drag.call(node, event, d);
        });

        node.on("click", (event, d) => {
            // Handle node selection
            console.log("Node Clicked:", d.data);
            this.handleNodeClick(d.data);
        });

        // Add right-click listener for the graph background
        /*
        svg.on("contextmenu", (event, d) => {
            event.preventDefault(); // Prevent default browser context menu
            // Custom actions for right-click on the graph background
            console.log("Graph Right-clicked");
        });
        */
    
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    
        // Add zoom behavior to the zoom container
        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", (event) => {
                zoomContainer.attr("transform", event.transform);
            });
        
        svg.call(zoom);
    
        // Append the SVG to the specified div
         
        this.innerDiv.innerHTML = '';
        this.innerDiv.appendChild(svg.node());
    }
    

    drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

   addNode(parentId, newNode) {
    const findNodeById = (node, targetId) => {
        if (node.id === targetId) {
            return node;
        }
        if (node.children) {
            for (const child of node.children) {
                const foundNode = findNodeById(child, targetId);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    };

    const parent = findNodeById(this.data, parentId);

    if (parent) {
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(newNode);

        // Recreate the force-directed tree with updated data
        this.createForceDirectedTree();
    } else {
        console.error("Parent node not found.");
    }
}

}
