class vi_WindowFormater{

    constructor(){
        
       this.zIndexCounter = 9999999; 
    
    }

    positionDiv(divId, x, y) {
        const div = document.getElementById(divId);
        if (div && div.style) {
            div.style.position = 'absolute';
            div.style.left = x + 'px';
            div.style.top = y + 'px';
        }
    }

    formatWindow(divElement, titulo, width,  initialHeight) {


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
    
    
    
          $(divElement).on("mousedown", () => {
            // Increment the counter
            this.zIndexCounter++;
          
            // Set the z-index
            $(divElement).css({
              zIndex: this.zIndexCounter,
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
            color: "#ffffff",
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
          css: {
            display: "flex",
            justifyContent: "space-between", // Aligns items with space between them
            alignItems: "center", // Aligns items vertically
            width: "100%", // Ensures the container takes full width
          },
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
            $(divElement).css({ height: "55px", maxHeight: "650px", visibility: "visible" });
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

    setWindowTitle(divElement, newTitle) {
      var titleColumn = $(divElement).find('.title-column');
      titleColumn.text(newTitle);
    }



    insertHtmlContent(divElement, htmlContent) {
        const container = document.getElementById(divElement);

        if (container) {
            // Find the top bar container
            const topBarContainer = container.querySelector('.top-bar-container');

            if (topBarContainer) {
                // Insert the provided HTML content after the top bar container
                topBarContainer.insertAdjacentHTML('afterend', htmlContent);
            }
        }
    }
    



}

export {vi_WindowFormater as vi_WindowFormater};