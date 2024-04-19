const createDiv = config => {

	config = config || { };

	let div = document.createElement('div');

		if(config.id)
			div.id = config.id;

		if(config.class)
			$(div).addClass(config.class);


		if(config.css)
			$(div).css(config.css);


	return div;

};


const positionInfoDiv = (infoDivId, usingScene, config = { }) => {

	let infoDivWidth = $(`#${infoDivId}`).outerWidth();
    let infoDivHeight = $(`#${infoDivId}`).outerHeight();

    let mouseCoords = usingScene.getMouse();
    let mouseScreenCoords = usingScene.getMouseOnScreen();

	let hPadding = config.hPadding || 5;
	let vPadding = config.vPadding || 5;

	let boundingRectangle = usingScene._scene.VOneData.container.getBoundingClientRect();

    let infoDivX = boundingRectangle.left + (mouseCoords.x < 0 ? mouseScreenCoords.x + hPadding : mouseScreenCoords.x - infoDivWidth - hPadding);
    let infoDivY = boundingRectangle.top + ( mouseCoords.y > 0 ? mouseScreenCoords.y + vPadding : mouseScreenCoords.y - infoDivHeight - vPadding);

    $(`#${infoDivId}`).css({ 'top':`${infoDivY}px`, 'left':`${infoDivX}px` });

};


const to2 = (number) => {

    if(number < 10){
        return `0${number}`;
    }

    return number;
}


const numberFormat = (value, decimalPositions, decimalSeparator, thousandsSeparator) => {

	decimalPositions = isNaN(decimalPositions = Math.abs(decimalPositions)) ? 2 : decimalPositions;
    decimalSeparator = decimalSeparator === undefined ? "." : decimalSeparator;
    thousandsSeparator = thousandsSeparator === undefined ? "," : thousandsSeparator;
    let sign = value < 0 ? "-" : "";
    let i = String(parseInt(value = Math.abs(Number(value) || 0).toFixed(decimalPositions)));
	let k = i.length;
    j = k > 3 ? k % 3 : 0;

   return sign + (j ? i.substr(0, j) + thousandsSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsSeparator) + (decimalPositions ? decimalSeparator + Math.abs(value - i).toFixed(decimalPositions).slice(2) : "");

}


const stripUselessChars = (text) => {

	return text.replace(/\W/gmi, '_');

}



const getSortFunction = (prop, reverse, transform) => {

	let key = currentTransform ? el => transform(el[prop]) : el => el[prop];

	reverse = !reverse ? 1 : -1;

	return (a, b) => { a = key(a), b = key(b); return reverse * ((a > b) - (b > a))};

}



const setArrayIndexes = (array) => {

	if(Array.isArray(array)){

		array.forEach((el, i) => {

			el.originalIndex = i;

		});

		return array;

	} else {

		return new Error('An array must be passed to method setArrayIndexes.');

	}

}


const getRange = (values, propName) => {

	if(!Array.isArray(values)){

		return new Error('An array must be pased to getRange method.');

	}

	let tmpArray;

	if(propName){

		tmpArray  = Array.from(values, o => o[propName]);


	} else {

		tmpArray = values;

	}


	return {
		min: Math.min(...tmpArray),
		max:  Math.max(...tmpArray)
	};


}


const arrayToObject = (array, keyField) =>
   array.reduce( (obj, item) => {
     obj[item[keyField]] = item;
     return obj;
 }, { } );


 // const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];



 const findInArray = (array, searchCallback, startIndex) => {

	 let el, found, index;

	 for(let i = 0; i < array.length; i++){

		 index = (startIndex + i) % (array.length - 1);

		 found = searchCallback(array[index], index);

		 if(found){
			 return array[index];
		 }

	 }

 }


 const setStatus = (status) => {

	 $('#statusDiv').text(status);

 }


 const cropText = (text, length) => {

	 length = length || 15;

	 let result = text;

	 if(text.length > length){

		 result = `${result.substr(0, length - 3)}...`;

	 }

	 return result;

 }
