

/*


    Visual Interaction Systems Corp.

    Funciones auxiliares para el manejo de Tool Tips (jquery, d3.js)

    vix_tt (vix tool tip)


*/






// Crea contador global para z-order de los tooltips :


var zIndexCounter = 9999999;



// Formatea un numero, eliminando decimales y separando por comas.

function vix_tt_formatNumber(value) {

    // Redondea
    var roundedValue = Math.round(parseFloat(value));
  
    // Separa por comas 
    var formattedValue = roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
    return formattedValue;
  }


// Funcion que lee de un div aquellos elementos de la clase .bar-rect
// y genera transiciones en base a su atributo width.
// Realiza 1000 operaiones 

function vix_tt_transitionRectWidth(containerID) {
    // Seleccciona Contenedor
    var container = d3.select(`#${containerID}`);
    // Selecciona elementos
    var rects = container.selectAll(".bar-rect");
  
    // Para cada elemento
    rects.each(function(d, i) {
        // Selecciona width original
      var originalWidth = d3.select(this).attr("width");
  
      // Pone el width en 0 
      d3.select(this).attr("width", 0)
        // Applica transicion :
        .transition()
        .duration(1000) // mil milisegundos
        .attr("width", originalWidth);  
    });
  }



  // Funcion que posiciona divs

  function vix_positionDiv(divId, x, y) {
    const div = document.getElementById(divId);
    if (div && div.style) {
        div.style.position = 'absolute';
        div.style.left = x + 'px';
        div.style.top = y + 'px';
    }
}


  // Funcion que da append de un div a otro

  function vix_appendDivToParent(divId, parentId) {
    // Find the parent element by its ID
    const parentElement = document.getElementById(parentId);

    if (parentElement) {
        // Create a new div element
        const newDiv = document.getElementById(divId);


        newDiv.style.width = 800 + 'px'; // Set width in pixels
        newDiv.style.height = 600 + 'px'; 
        

        // Append the new div to the parent element
        parentElement.appendChild(newDiv);
    } else {
        console.error(`Parent element with ID "${parentId}" not found.`);
    }
}











  // Funcion que distribuye un grupo de tooltips en la ventana


  function vix_tt_distributeDivs(tooltips) {
    // 600,200 es la posicion inicial
    distributeDivs(300,110,tooltips,  40, 40)

  }

  function distributeDivs(in_x, in_y, divs, marginX, marginY) {

    let x = in_x;
    let y = in_y;

    const innerWidth = window.innerWidth;  
    const innerHeight = window.innerHeight;

     

    const positions = [{ x, y }]; // Arreglo que guarda posiciones disponibles
                                  // Al principio solo hay una.

    // Recorre cada DIV
    divs.forEach((div, index) => {
      
      const $div = $(div);
      const divWidth = $div.width() + marginX;
      const divHeight = $div.height() + marginY;

      console.log("div num", index);
  
      let positionIndex = -1; // Indice de la posicion seleccionada
      
      // Checa las posiciones disponibles
      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        const { x: posX, y: posY } = position;
  
        // Checa si el div cabe, si cabe a la derecha selecciona esa posicion.
        if ((posX + divWidth <= 1.2 * innerWidth) && (posY + divHeight <= innerHeight)) {
             
                console.log("Si cupo", posY, divHeight, innerHeight);
                positionIndex = i;
                break; 
            
        }
      }
  
     

      // Si no encontro ninguna para caber completa
      
      if (positionIndex === -1) {

        console.log("NO CUPO");

      }
      
      
      
  
      // selecciona datos de la posicion y posiciona el div
      if (positionIndex !== -1) {

        
        const position = positions.splice(positionIndex, 1)[0];  // Elimina la posicion encontrada para que nadie la tome
        const { x: posX, y: posY } = position;
        console.log("Posicion encontrada", position);
  
        // Posiciona el DIV
        $div.css({ left: posX, top: posY });
  
        // Calcula 2 siguientes posibles posiciones : a la derecha y abajo

        const rightPosition = { x: posX + divWidth, y: posY };
        const belowPosition = { x: posX, y: posY + divHeight };

        //console.log("posX",posX);
        //console.log("divWidth",divWidth);
  
        positions.push(rightPosition)
        positions.push(belowPosition);
        
        console.log("posicion derecha ", rightPosition);
        console.log("posicion abajo ", belowPosition);
      }
    });
  }
  


  function vix_tt_distributeDivs_old(tooltips) {

    let x = 600;
    let y = 150;

    let currentX = x;
    let currentY = y;
    const windowWidth = window.innerWidth; // Get the current screen width
    const windowHeight = window.innerHeight;

    let maxWidth = windowWidth;
    let maxHeight = windowHeight;
     
    let x_separation = 30;
    let y_separation = 30;
    let row = 0;
    let column = 0;

    
    tooltips.forEach((div, index) => {

      if (currentX + $(div).width() > maxWidth) {
          currentX = x;
          currentY = y + $(tooltips[index-column]).height() + y_separation;
          if(row == 1){
             currentY +=  $(tooltips[0]).height() + y_separation;
          }
             row = row + 1;

          if(currentY + $(div).height() > maxHeight){
            column = column + 1;
            currentX = $(tooltips[index-column + 1]) + x_separation;
            currentY = $(tooltips[index-column + 1]).height + y_separation;
  
          }

          
      }


     
      $(div).css({ left: currentX, top: currentY });

      currentX += $(div).width() + x_separation;
      column = column + 1;
      
      
  });

}








/*

  Formatea cualquier elemento DIV del DOM :

    - hace que sea draggable
    - coloca una barra en la parte superior con un titulo
    - Agrega un boton de cerrado
    - Ajusta a un width determinado

*/


function vix_tt_formatToolTip(divElement, titulo, width,  initialHeight) {


    $(divElement).html("");

    var tooltipHeight = initialHeight || "auto";

    var isCollapsed = false;
    var originalHeight = $(divElement).css("height");

    // Ajusta Estilo
    $(divElement).css({
      position: "fixed",

      border: "1px solid #6e647b",
      borderRadius: "7px",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      boxShadow: "rgba(0, 0, 0, .5) 19px 15px 24px",
      width: width+"px", 
      height: tooltipHeight,
      //maxHeight: "80%",
      minwidth: "400px",
      overflow:"hidden",
     
    });

        // Para ocultar las barras de desplazamiento personalizadas en navegadores WebKit
      $(divElement).addClass('hide-scrollbar-webkit');

    // Para ocultar las barras de desplazamiento en Firefox
      $(divElement).addClass('hide-scrollbar-firefox');

    // Para ocultar las barras de desplazamiento en IE y Edge
      $(divElement).addClass('hide-scrollbar-ie-edge');



    $(divElement).on("mousedown", function () {
      // Incrementa el contador global z-index 
      zIndexCounter++;
  
      // Setea el z-index 
      $(divElement).css({
        
        zIndex: zIndexCounter,
      });

    });


    // Capacidad de resize

    var resizeIndicator = $("<i>", {
      class: "fas fa-expand", // icono
      css: {
        position: "absolute",
        bottom: "0", // posicion abajo
        right: "0", // posicion derecha
        cursor: "se-resize", // Cambio de forma del cursor al dar resize
        padding: "5px", // se agrega un padding para que no este tan pegado
        color: "#877575",
      },
    });
  
    // Se agrega el indicador para hacer evidente que la ventana tiene resize
    $(divElement).append(resizeIndicator);
  
    // Hace que la ventana sea resizeable
    $(divElement).resizable({
      handles: "se", // Se despliega el indicador
      minHeight: 30, // height minimo
      minWidth: 400, // width minimo
      maxHeight: "80%", // maximo height
      maxWidth: "80%", // maximo width
      start: function (event, ui) {
        // Checa si esta colapsada la ventana
        isCollapsed = $(divElement).css("height") === "30px";
      },
      resize: function (event, ui) {
        // Si esta colapsada, ajusta minHeight 
        if (isCollapsed) {
          $(this).resizable("option", "minHeight", 31);
        } else {
          // usa el height original
          $(this).resizable("option", "minHeight", originalHeight);
        }
      },
    });


    var alignToTop = {
      "align-self": "flex-start",
    };

    var topBar = $("<div>", {
      class: "top-bar",
      css: {
        padding: "5px",
        backgroundColor: "#507D8C",
        borderTopLeftRadius: "0px",

        borderTopRightRadius: "0px",
        cursor: "move",
        paddingRight: "20px",
      },
    });



    var topBarContainer = $("<div>", {
      class: "top-bar-container",
    });

    var titleColumn = $("<div>", {
      class: "title-column",
      text: titulo,
    });
  
   
    var dragHandle = $("<span>", {
      class: "drag-handle",
      
    });
    titleColumn.append(dragHandle);
  
  

    var iconsColumn = $("<div>", {
      class: "icons-column",
      css: {
        "align-self": "flex-start",
        "align-items": "flex-start", // Align items to the top
      },
    });
  
    
    var collapseButton = $("<button>", {
      class: "collapse-button",
      
    }).append('<i class="fas fa-minus"></i>');
    iconsColumn.append(collapseButton);
  
    
    var closeButton = $("<button>", {
      class: "close-button",
      
    }).append('<i class="fas fa-times"></i>');
    iconsColumn.append(closeButton);
  
    
    topBarContainer.append(titleColumn);
    topBarContainer.append(iconsColumn);
    topBar.append(topBarContainer);
  

    

   

    // Agrega la barra superior al div
    $(divElement).prepend(topBar);

  
    
    

   

    // Asocia evento de cerrado : OJO , Usa el CSS, no el visible del DOM
    closeButton.on("click", function () {
      $(divElement).css("visibility","hidden");
    });

    

    
    
  
    // Crea el evento para colapsar o expander la ventana
    collapseButton.on("click", function () {
      if (isCollapsed) {
        $(divElement).css({ height: originalHeight, maxHeight: "650px", visibility: "visible" });
        collapseButton.find("i").removeClass("fa-plus").addClass("fa-minus"); // Cambia el icono a menos  -
        isCollapsed = false;
      } else {

        originalHeight = $(divElement).css("height");
        $(divElement).css({ height: "30px", maxHeight: "650px", visibility: "visible" });
        collapseButton.find("i").removeClass("fa-minus").addClass("fa-plus"); // Cambia el icono a +
        isCollapsed = true;
      }
    });



    // Manejo de DRAG de forma manual para permitir scroll

  var isDragging = false;
  var offsetX, offsetY;

  // Asigna evento mousedown solo al topBAR
  topBar.on("mousedown", function (e) {
    isDragging = true;

    // Calcula el offset del mouse a la parte superior izquierda del tooltip como referencia
    var tooltipOffset = $(divElement).offset();
    offsetX = e.pageX - tooltipOffset.left;
    offsetY = e.pageY - tooltipOffset.top;
  });

  // El mouseup cancela el drag
  $(document).on("mouseup", function () {
    isDragging = false;
  });

  // Responde al mousemove si esta en modo de drag solamente
  $(document).on("mousemove", function (e) {
    if (isDragging) {
      // Calcula la posicion y realiza el drag

      var newTop = e.pageY - offsetY;

      if(newTop < 0){
        newTop = 0;
      }



      $(divElement).css({
        left: e.pageX - offsetX,
        top:  newTop,
      });
    }
  });

  }




  function vix_tt_formatCanvas(divElement, titulo, width,  initialHeight) {


    $(divElement).html("");

    var tooltipHeight = initialHeight || "auto";

    var isCollapsed = false;
    var originalHeight = $(divElement).css("height");

    // Ajusta Estilo
    $(divElement).css({
      position: "fixed",

      border: "1px solid #6e647b",
      borderRadius: "7px",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      boxShadow: "rgba(0, 0, 0, .5) 19px 15px 24px",
      width: width+"px", 
      height: tooltipHeight,
      //maxHeight: "80%",
      minwidth: "400px",
      overflow:"hidden",
     
    });

        // Para ocultar las barras de desplazamiento personalizadas en navegadores WebKit
      $(divElement).addClass('hide-scrollbar-webkit');

    // Para ocultar las barras de desplazamiento en Firefox
      $(divElement).addClass('hide-scrollbar-firefox');

    // Para ocultar las barras de desplazamiento en IE y Edge
      $(divElement).addClass('hide-scrollbar-ie-edge');


   

  }





  // Esta funcion formatea un DIV como menu (No hay boton de colapso, solo drag y hide)

  function vix_tt_formatMenu(divElement, titulo, width,  initialHeight) {


    var currentTop = parseInt($(divElement).css("top"));

   
    


    $(divElement).html("");

    var tooltipHeight = initialHeight || "auto";

    // Ajusta Estilo
    $(divElement).css({
      position: "absolute",
      top: "5%",
      border: "1px solid #6e647b",
      borderRadius: "7px",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      boxShadow: "rgba(0, 0, 0, .5) 19px 15px 24px",
      width: width+"px", 
      height: tooltipHeight,
      maxHeight: "850px",
      overflow:"auto",
     
    });


    if (currentTop < 10) {
    
      $(divElement).css({top: 50});
    }


    // Para ocultar las barras de desplazamiento personalizadas en navegadores WebKit
      $(divElement).addClass('hide-scrollbar-webkit');

    // Para ocultar las barras de desplazamiento en Firefox
      $(divElement).addClass('hide-scrollbar-firefox');

    // Para ocultar las barras de desplazamiento en IE y Edge
      $(divElement).addClass('hide-scrollbar-ie-edge');



    $(divElement).on("mousedown", function () {
      // Incrementa el contador global z-index 
      zIndexCounter++;
  
      // Setea el z-index 
      $(divElement).css({
        
        zIndex: zIndexCounter,
      });

    });


    

    
   

    // Crea barra superior
    var topBar = $("<div>", {
      class: "top-bar",
      css: {
        padding: "5px",
        backgroundColor: "#1f2e39",
        borderTopLeftRadius: "0px",

        borderTopRightRadius: "0px",
        cursor: "move",
      },
    });

    // Crea la zona de drag
    var dragHandle = $("<span>", {
      class: "drag-handle",
      text: titulo,
      
      css: {
        cursor: "move",
        fontSize: "18px",
      },
    });



    

    // Crea boton de cerrado
    var closeButton = $("<button>", {
        class: "close-button",
        css: {
          float: "right",
          cursor: "pointer",
          color: "white",
          backgroundColor: "transparent",
          border: "none",
          color: "#998383",
        },
      }).append('<i class="fas fa-times"></i>'); 

    // A la barra le agrega la zona de cerrado y el boton de cerrado
    topBar.append(dragHandle);
   
    topBar.append(closeButton);

    // Agrega la barra superior al div
    $(divElement).prepend(topBar);
    

   

    // Asocia evento de cerrado : OJO , Usa el CSS, no el visible del DOM
    closeButton.on("click", function () {
      $(divElement).css("visibility","hidden");
    });

    


    // Manejo de DRAG de forma manual para permitir scroll

  var isDragging = false;
  var offsetX, offsetY;

  // Asigna evento mousedown solo al topBAR
  topBar.on("mousedown", function (e) {
    isDragging = true;

    // Calcula el offset del mouse a la parte superior izquierda del tooltip como referencia
    var tooltipOffset = $(divElement).offset();
    offsetX = e.pageX - tooltipOffset.left;
    offsetY = e.pageY - tooltipOffset.top;
  });

  // El mouseup cancela el drag
  $(document).on("mouseup", function () {
    isDragging = false;
  });

  // Responde al mousemove si esta en modo de drag solamente
  $(document).on("mousemove", function (e) {
    if (isDragging) {
      // Calcula la posicion y realiza el drag
      $(divElement).css({
        left: e.pageX - offsetX,
        top: e.pageY - offsetY,
      });
    }
  });





  }






  // Crea una barra inferior con un icono para descargar

  function vix_tt_formatBottomBar(divElement, exportHandler) {
    // Crea un espacio para que la barra no se pegue
    var spacer = $("<div>", {
      css: {
        height: "20px",  
      },
    });
  
    // Crea la barra inferior
    var bottomBar = $("<div>", {
      class: "bottom-bar",
      css: {
        padding: "5px",
        height: "20px",
        width: "28px",
        backgroundColor: "#1f2e39",
        borderTopLeftRadius: "2px",
        borderTopRightRadius: "2px",
      },
    });

    var iconAndButtonContainer = $("<div>", {
      css: {
        float: "left", // Float the container to the left
      },
    });
  
    // Crea el boton de descarga
    var downloadButton = $("<button>", {
      class: "download-button",
      css: {
        float: "right",
        cursor: "pointer",
        backgroundColor: "transparent",
        border: "none",
        color: "white",
      },
    }).append('<i class="fas fa-download"></i>');
  
     
    iconAndButtonContainer.append(downloadButton);

 
    bottomBar.append(iconAndButtonContainer); 


  //var containerDiv = d3.select(`#${containerID}`);

  var contentDiv = $(divElement).find(".content");

   


  
    // agrega el espacio
    $(contentDiv).append(spacer);
  
    // Agrega la barra
    $(contentDiv).append(bottomBar);

    $(contentDiv).css("height", "97%");   // recalcula al 80%
  
    // Agrega el evento on Click
    downloadButton.on("click", function () {
      exportHandler(); // LLama a la funcion que recibe como parametro
    });
  }
  

  // Funcion auxiliar que formatea los datos para descargar en excel (Pone los nombres de las columnas)

  function formatDataForExport(data, columns) {
    var formattedData = [];
    
    // Agrega la fila con los nombres
    var headerRow = columns.map(function(column) {
      return column.header;
    });
    formattedData.push(headerRow);
  
    // Agrega las filas de datos
    data.forEach(function(row) {
      var rowData = columns.map(function(column) {
        return row[column.key];
      });
      formattedData.push(rowData);
    });
  
    return formattedData;
  }
  



// Realiza la descarga en Excel
function exportToExcel(data, filename) {
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Especifica el formato como binario
  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

  // Convierte un string en Blob
  var blob = new Blob([s2ab(wbout)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Crea un link para la descarga
  var downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename + ".xlsx";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Convierte el string s en un array buffer
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}
  
  
  /*

    vix_tt_table  : Crea una tabla en un container (div)


  */


  function vix_tt_table(data, columns, columnVisitors, containerID) {



    var containerDiv = d3.select(`#${containerID}`)
    .append("div")
    .style("height", "100%") // Set the height to 100% to match the div's actual height
    .style("overflow", "auto");


    var table = containerDiv.append("table")
      .classed("tooltip-table", true)
      .style("border-collapse", "collapse")
      .style("border", "0px solid white");
    

     
  
    var thead = table.append("thead"); // Table header
    var tbody = table.append("tbody"); // Table body
  
    // Agrega fila header con iconos en las columnas sorteables
    thead.append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
      .attr("class", "header-cell")
      .style("width", function(column) {
        return column.width;
      })
      .html(function(column, index) {
        var sortable = column.sortable;
        var sortOrder = sortable ? this.getAttribute("data-sort-order") : null;
        var sortIcon = sortable ? (sortOrder === "ascending" ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') : '';
        return column.header + ' ' + sortIcon;
      })
      .style("cursor", function(column, index) {        // Tipo de cursor
        return column.sortable ? "pointer" : "default";
      })
      .on("click", function(column, index) {    // Aplica logica de ordenamiento :
        if (column.sortable) {

            // Manejo de logica de orden ascendente/descendente

            var sortOrder = this.getAttribute("data-sort-order") || column.defaultSortOrder;
            var newSortOrder = sortOrder === "ascending" ? "descending" : "ascending";
    
            // Borra todos los iconos
            thead.selectAll("th")
              .attr("data-sort-order", null)
              .selectAll("i")
              .remove();
    
            // Actualiza el icono solo de la columna seleccionada
            d3.select(this).attr("data-sort-order", newSortOrder)
              .selectAll("i")
              .remove()
              .data([newSortOrder])
              .enter()
              .append("i")
              .attr("class", function(d) {
                return d === "ascending" ? "fas fa-sort-up" : "fas fa-sort-down";
              });
    
            // Realiza el sort de todos los renglones en base a la columna seleccionada y el orden (asc o desc)
            tbody.selectAll("tr")
              .sort(function(a, b) {
                return newSortOrder === "ascending" ? d3.ascending(a[column.key], b[column.key]) : d3.descending(a[column.key], b[column.key]);
              });
    
            // Guarda en data-sort-order el orden
            this.setAttribute("data-sort-order", newSortOrder);
   
        }
      });
  
    // Crea una fila (tr) para cada renglon de data
    var rows = tbody.selectAll("tr")
      .data(data)
      .enter()
      .append("tr");
  
    // Crea una celda (td) para cada columna en data
    var cells = rows.selectAll("td")
      .data(function(row) {
        return columns.map(function(column) {
          return { column: column, value: row[column.key] };
        });
      })
      .enter()
      .append("td")
      .attr("class", "body-cell")
      .style("width", function(d) {
        return d.column.width;
      })
      .html(function(d) {
        var visitor = columnVisitors[d.column.key];                          // Aplica visitors para cada celda
        return visitor ? visitor(d.value) : d.value;    // si no hay visitor valor tal cual
      });
  
    return table;
  }
  

   /*

    vix_tt_table  : Crea una tabla en un container (div)


  */
     

    function vix_tt_table_extended(data, columns, columnVisitors, totalsColumnVisitors, containerID,  columnsWithTotals) {
     

      var containerDiv = d3.select(`#${containerID}`)
        .append("div")
        .attr("class", "content") // Content es el div al que se le habilita scroll.
        .style("height", "100%") 
        .style("overflow", "auto"); // habilita scroll

    
      var table = containerDiv.append("table")
          .classed("tooltip-table", true)
          .style("border-collapse", "collapse")
          .style("border", "0px solid white");


            



        // CREA TABLA, Aplica estilos 
    
       
      
        var thead = table.append("thead"); // Table header
        var tbody = table.append("tbody"); // Table body
      
        // Agrega fila header con iconos en las columnas sorteables
        thead.append("tr")
          .selectAll("th")
          .data(columns)
          .enter()
          .append("th")
          .attr("class", "header-cell")
          .style("width", function(column) {
            return column.width;
          })
          .html(function(column, index) {
            var sortable = column.sortable;
            var sortOrder = sortable ? this.getAttribute("data-sort-order") : null;
            var sortIcon = sortable ? (sortOrder === "ascending" ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') : '';
            return column.header + ' ' + sortIcon;
          })
          .style("cursor", function(column, index) {        // Tipo de cursor
            return column.sortable ? "pointer" : "default";
          })
          .on("click", function(column, index) {    // Aplica logica de ordenamiento :
            if (column.sortable) {
    
                // Manejo de logica de orden ascendente/descendente
    
                var sortOrder = this.getAttribute("data-sort-order") || column.defaultSortOrder;
                var newSortOrder = sortOrder === "ascending" ? "descending" : "ascending";
        
                // Borra todos los iconos
                thead.selectAll("th")
                  .attr("data-sort-order", null)
                  .selectAll("i")
                  .remove();
        
                // Actualiza el icono solo de la columna seleccionada
                d3.select(this).attr("data-sort-order", newSortOrder)
                  .selectAll("i")
                  .remove()
                  .data([newSortOrder])
                  .enter()
                  .append("i")
                  .attr("class", function(d) {
                    return d === "ascending" ? "fas fa-sort-up" : "fas fa-sort-down";
                  });
        
                // Realiza el sort de todos los renglones en base a la columna seleccionada y el orden (asc o desc)
                tbody.selectAll("tr")
                  .sort(function(a, b) {
                    return newSortOrder === "ascending" ? d3.ascending(a[column.key], b[column.key]) : d3.descending(a[column.key], b[column.key]);
                  });
        
                // Guarda en data-sort-order el orden
                this.setAttribute("data-sort-order", newSortOrder);
       
            }
          });

          
      
        // Crea una fila (tr) para cada renglon de data
        var rows = tbody.selectAll("tr")
          .data(data)
          .enter()
          .append("tr");
      
        // Crea una celda (td) para cada columna en data
        var cells = rows.selectAll("td")
          .data(function(row, rowIndex) {
            return columns.map(function(column) {
              return { column: column, value: row[column.key],rowIndex: rowIndex  };
            });
          })
          .enter()
          .append("td")
          .attr("class", "body-cell")
          .style("width", function(d) {
            return d.column.width;
          })
          .html(function(d) {
            var visitor = columnVisitors[d.column.key];                          // Aplica visitors para cada celda
            return visitor ? visitor(d.value, d.rowIndex) : d.value;    // si no hay visitor valor tal cual
          });

         
           // CREA UNA TABLA SEPARADA CON LOS TOTALES

                var totalsTable = containerDiv.append("table")
                .classed("tooltip-table", true)
                .style("border-collapse", "collapse")
                .style("border", "1px solid white");  

            var totalsTbody = totalsTable.append("tbody");  

            // Cotadores en 0
            var columnTotals = {};
            columnsWithTotals.forEach(function(columnKey) {
                columnTotals[columnKey] = 0;
            });

            // Calcula totales para cada columna
            data.forEach(function(row) {
                columnsWithTotals.forEach(function(columnKey) {
                    columnTotals[columnKey] += row[columnKey];
                });
            });

            // Crea fila de totales
            var totalsRow = totalsTbody.append("tr")
                .attr("class", "totals-row");

            // Crea celdas
            var totalsCells = totalsRow.selectAll("td")
                
                .data(function() {
                    return columns.map(function(column) {
                        if (columnsWithTotals.includes(column.key)) {
                            return { column: column, value: columnTotals[column.key], width: column.width };
                        } else {
                            return { column: column, value: '', width: column.width  };
                        }
                    });
                })
                .enter()
                .append("td")
                .attr("class", "body-cell")
                .style("border", "0px solid white") 
                .style("width", function(d) {
                  return d.width; // Usa los mismos anchos que las columnas de la tabla de datos
                })
                .html(function(d) {
                  var visitor = totalsColumnVisitors[d.column.key] || totalsColumnVisitors[d.column.key] || (function() { return ''; });

                   
                    return visitor ? visitor(d.value) : d.value;
                });




      
        return table;
      }

   



      function createBarx(p1, p2, p3, svgWidth, svgHeight) {
        
        var totalPercentage = p1 + p2 + p3;
        //if (totalPercentage !== 100) {
        //    throw new Error("Error, debe sumar 100%");
       // }
    
        // Calcula los widths de las 3 partes
        var width1 = (p1 / 100) * svgWidth;
        var width2 = (p2 / 100) * svgWidth;
        var width3 = (p3 / 100) * svgWidth;
    
        // Crea el svg
        var svgCode = '<svg width="' + svgWidth + '" height="' + svgHeight + '">' +
            '<rect x="0" y="0" width="' + width1 + '" height="' + svgHeight + '" style="fill: blue;"></rect>' +
            '<rect x="' + width1 + '" y="0" width="' + width2 + '" height="' + svgHeight + '" style="fill: green;"></rect>' +
            '<rect x="' + (width1 + width2) + '" y="0" width="' + width3 + '" height="' + svgHeight + '" style="fill: orange;"></rect>' +
            '</svg>';
    
        return svgCode;
    }

    function createBar(p1, p2, p3, svgWidth, svgHeight, labelText) {
      
      var totalPercentage = p1 + p2 + p3;
      //if (totalPercentage !== 100) {
      //    throw new Error("Total percentage must be 100%");
      // }
  
      // Calcula los widths de las 3 partes
      var width1 = (p1 / 100) * svgWidth;
      var width2 = (p2 / 100) * svgWidth;
      var width3 = (p3 / 100) * svgWidth;
  
      // Crea  el SVG (coloca un label solo en el primero)
      var svgCode = '<svg width="' + svgWidth + '" height="' + svgHeight + '">' +
          '<rect x="0" y="0" width="' + width1 + '" height="' + svgHeight + '" style="fill: #4989FF;"></rect>' +
          '<rect x="' + width1 + '" y="0" width="' + width2 + '" height="' + svgHeight + '" style="fill: #FFF117;"></rect>' +
          '<rect x="' + (width1 + width2) + '" y="0" width="' + width3 + '" height="' + svgHeight + '" style="fill: #FF0018;"></rect>' +
          '<text x="5" y="' + (svgHeight / 2) + '" dominant-baseline="middle" style="fill:#FFFFFF">' + labelText + '</text>' +
          '</svg>';
  
      return svgCode;
  }
  
  
  
  
    