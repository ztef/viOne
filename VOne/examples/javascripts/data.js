let records = [ ];

const initData = (cb) => {

    //  *****   DO ANY PREVIOUS DATA LOADING AND DELIVER IT TO data VARIABLE    *****   //

    let data = [
        {
            heightIndex: 25,
            orbitIndex: 1,
            section: 'section01'      
        },
        {
            heightIndex: 25,
            orbitIndex: 3,
            section: 'section02' 
        },
        {
            heightIndex: 25,
            orbitIndex: 3,
            section: 'section03' 
        },
        {
            heightIndex: 55,
            orbitIndex: 1,
            section: 'section04' 
        },
        {
            heightIndex: 25,
            orbitIndex: 2,
            section: 'section05' 
        },
    ];

    let originalLength = data.length;

    records = [...data];

    cb(records);

    


}
