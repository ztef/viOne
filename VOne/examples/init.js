let isExtruded, isDepthed, searching, selectionList, isSelecting = false;
const GLOBAL_MULTIPLIER = 6;


const reset = (dir, cb) => {

    visualization.restoreOriginalPositions(dir, () => {

        if(dir.indexOf ('ext') > -1) {
            isExtruded = false;
            $('#extrudeSort .dashboard-item-value').text('');
        }


        if(dir.indexOf ('depth') > -1){
            isDepthed = false;
            $('#verticalSort .dashboard-item-value').text('');
        }

        visualization.restoreOriginalColors(() => {

            $('#colorSort .dashboard-item-value').text('');

        });


        if(typeof cb === 'function'){
            cb();
        }
    });

}





const extrudeSome = (prop, value, cb) => {

    visualization.extrudeSome(prop, value, (r) => {

        isExtruded = true;
        cb(r);

    });

}



const depthSome = (prop, value, cb) => {

    visualization.depthSome(prop, value, (r) => {

        isDepthed = true;
        cb(r);

    });

}


const emulateSeach = () => {

    searching = true;

    let searchLength = $('#searchInput').val().length;

    visualization.emulateSeach(searchLength, () => {

        if(searchLength > 7){

            visualization.focusOnSearch();

        }

    });



}



const clearSearch = () => {

    searching = false;
    $('#searchInput').val('');
    visualization.clearSearch();

}


const toggleSelectionMode = () => {

    
    visualization.toggleSelection();
}




const initApp = () => {

    initVisualization();

    initData((r) => {    //  *****   emulated data in/loaded-from data.js

        //$('#dashTotal .dashboard-item-value').text(numberFormat(records.length, 0));

        visualization.displayInitial(r);

    });

}
