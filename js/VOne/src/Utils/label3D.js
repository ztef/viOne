/**
* Creates 2D planes with text for using them in a 3D scene. The plane will contain a canvas with dimensions according to the text and config parameters provided.
*
* @class VOne.Label3D
* @constructor VOne.Label3D
* @param {string} text The text to create. Ideally, you should provide just one line of text. [TODO: change this parameter to accept an array, each element would be a line with text].
* @param {Object} config Options for customizing the text.
* @param {string} config.fontFace Font face to be used. Defaults to Arial Narrow.
* @param {int} config.fontSize Size to be used in the font. Default is 18.
* @param {float} config.borderThickness Border thickness to be used in the font. Default is 0.
* @param {Object} config.backgroundColor Background color to be used with the text in the form { r: red, g: green, b: blue, a: alpha }. Default is { r:150, g:0, b:150, a:0.0 }
* @param {Object} config.textColor Color to be used for the text in the form { r: red, g: green, b: blue, a: alpha }. Default is { r:30, g:0, b:190, a:1.0 }.
* @param {String} config.textAlign Text align (left, center, right);
* @param {boolean} config.spriteMaterial Indicates if the returned object will use a sprite material (always facing to the camera). If not set or set to false, the returned object will be a plane containing the text.
* @param {number} config.lineLength Amount of max chars per line. Default is 27.
* @param {number} config.maxLines Max number of lines to be used. Default is 3.
* @param {number} config.lineHeight Lines height. Default is fontSize + 5.
* @param {number} config.canvasFixedWidth Texture canvas prefered width.
* @param {number} config.canvasFixedHeight Texture canvas preferred height.
*
* @return {THREE.Object3D} A plane containing the text with the provided parameters.
**/
VOne.Label3D = function( message, parameters ){

    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontFace") ? parameters.fontFace : "Arial Narrow";

    var fontSize = parameters.hasOwnProperty("fontSize") ? parameters.fontSize : 18;

    var lineLength = parameters.hasOwnProperty("lineLength") ? parameters.lineLength : 27;

    var maxLines = parameters.hasOwnProperty("maxLines") ? parameters.maxLines : 3;

    var lineHeight = parameters.hasOwnProperty("lineHeight") ? parameters.lineHeight : (fontSize + 5);

    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters.borderThickness : 2;

    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters.borderColor : { r:150, g:0, b:150, a:0.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters.backgroundColor : { r:255, g:255, b:255, a:0.0 };

    var textColor = parameters.hasOwnProperty("textColor") ? parameters.textColor : { r:30, g:0, b:190, a:1.0 };

    var canvasFixedWidth = parameters.canvasFixedWidth;

    var canvasFixedHeight = parameters.canvasFixedHeight;


    var textLines = [ ];


    if(typeof message === 'number'){

        message = message.toString();

    }


    var textWords = message.split(' ');

    var lineIsFull;

    var charsCount;

    var textWordsIndex = 0;

    for(var i = 0; i < maxLines && textWordsIndex < textWords.length; i++){

        textLines[i] = '';
        lineIsFull = false;
        charsCount = 0;

        while(!lineIsFull && textWordsIndex < textWords.length){

            if(charsCount + textWords[textWordsIndex].length < lineLength){

                textLines[i] += ' ' + textWords[textWordsIndex];
                textWordsIndex ++;
                charsCount = textLines[i].length;

            } else {
                textLines[i] += ' ';
                lineIsFull = true;
            }

        }

    }


    if(textWordsIndex < textWords.length){
        textLines[maxLines - 1] += '...';
    }


    var txtWidth = fontSize * lineLength;
    var txtHeight = textLines.length * lineHeight;


    var canvasWidth;

    if(canvasFixedWidth){

        canvasWidth = canvasFixedWidth;

    } else {

        canvasWidth = nearestPow2(txtWidth);

        if(canvasWidth < txtWidth){
            canvasWidth *= 2;
        }

    }



    var canvasHeight;

    if(canvasFixedHeight){

        canvasHeight = canvasFixedHeight;

    } else {

        canvasHeight = nearestPow2(txtHeight);

        if(txtHeight < canvasHeight){
            canvasHeight *= 2;
        }

    }




    var canvas = document.createElement('canvas');

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;


    var context = canvas.getContext('2d');

    context.font = fontSize + "px " + fontface;
    context.textAlign = parameters.textAlign || 'center';


    context.font = "" + fontSize + "px " + fontface;

    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";

    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;

    // roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontSize * 1.4 + borderThickness, 8);


    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";


    var xTextPos = Math.floor(canvasWidth / 2);
    var yTextPos = Math.ceil(canvasHeight / 2 - txtHeight / 2 + lineHeight / 2);


    textLines.forEach(function(line){

        context.fillText( line, xTextPos, yTextPos);
        yTextPos += lineHeight;

    });




    var texture = new THREE.Texture(canvas) ;

    texture.needsUpdate = true;


    var material;

    var object3D;



    if(parameters.spriteMaterial){

        material = new THREE.SpriteMaterial( { map: texture } );

        object3D = new THREE.Sprite( material );

    } else {

        material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthTest: true });
        material.transparent = true;
        object3D = new THREE.Mesh(new THREE.PlaneGeometry(512, 128), material);

    }


    return object3D;

};
