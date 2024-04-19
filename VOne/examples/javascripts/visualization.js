let visualization;


class Visualization{

    constructor(){

        let controlsConfig = {
            zoomSpeed: 0.4,
            panSpeed: 0.4,
            rotateSpeed: 0.7,
            dampingFactor: 0.2,
            autoRotateSpeed: 0.2,
            // autoRotate: true
        };


        let sceneCreator = new VOne.SceneCreator();

        this.glScene = sceneCreator.createScene({
            // bgColor: 0xffffff,
            glRenderer: THREE.CSS3DRenderer,
            bgAlpha: 0.0,
            controls: THREE.OrbitControls,
            parentType: 'div',
            containerId: 'detailView',
            controlsConfig: controlsConfig,
            verticalDegFOV: 25,
            bodyBGAlpha: 1,
            width: $('detail').width(),
            height: $('detail').height()
        });


        $('#detail').append($('#detailView'));

        let textureCanvas = document.createElement('canvas');
            textureCanvas.width = 128;
            textureCanvas.height = 128;
        textureCanvas.background = 'transparent';

        let context = textureCanvas.getContext('2d');
        let grad = context.createRadialGradient(64, 64, 1, 64, 64, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.666, 'rgba(240, 240, 240, 0.65)');
        grad.addColorStop(1, 'rgba(220, 220, 220, 0)');

        context.arc(64, 64, 64, 0, 2 * Math.PI);
        context.fillStyle = grad;
        context.fill();

        let particlesTexture = new THREE.Texture(textureCanvas);
        particlesTexture.needsUpdate = true;

        let shadersCreator = new VOne.ShaderCreator();


        let shader = shadersCreator.createShader(
        {
            color: 'color',
            size: 'size',
            points: true,
            useTHREETexture: particlesTexture,
            alpha: 'alpha'

        });

        this.particlesMaterial = new THREE.ShaderMaterial({

            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,

            depthTest: false,
            transparent: true

        });


        let surfacesShader = shadersCreator.createShader(
            {
                color: 'color',
                points: false,
                alpha: 'alpha'
            }
        )


        this.surfacesMaterial = new THREE.ShaderMaterial({

            uniforms: surfacesShader.uniforms,
            vertexShader: surfacesShader.vertexShader,
            fragmentShader: surfacesShader.fragmentShader,

            depthTest: false,
            transparent: true,
            side: THREE.DoubleSide

        });



        document.onkeyup = (event) => {

            if (event.keyCode === 32) {

               // Space bar released

           }

        }

        this.glScene.camera.position.setZ(3700);

        this.animationEngine = new VOne.AAnimation();

        this.zHeight = 7500;

        function animate(time) {
            requestAnimationFrame(animate);
            TWEEN.update(time);
        }
        requestAnimationFrame(animate);

        this.selecting = false;

        this.selection = new VOne.Selection3D(this.glScene);


    }


    displayInitial(_data){

        const dTheta = VOne.DoublePI / 7;
        const halfDTheta = dTheta / 2;

        const deltaRadiusModule = Math.ceil((CONFIG.outerRadius - CONFIG.innerRadius) / CONFIG.deltaRadius);

        const dThetaMinusHalfDegree = dTheta - VOne.degToRad / 2;


        let clusters = { };
        let clustersArray = [ ];

        for(let i = 0; i < _data.length; i++){

            let record = _data[i];

            let currentClustersKeys = Object.keys(clusters);


            if(!currentClustersKeys.includes(record.section)){

                let nextClusterIndex = currentClustersKeys.length;

                clusters[record.section] = nextClusterIndex;

                clustersArray.push({ name: record.section, clusterIndex: nextClusterIndex });

            }

            let angle = halfDTheta + clusters[record.section] * dTheta;

            let recordDistance = CONFIG.innerRadius + record.orbitIndex * CONFIG.deltaRadius;

            record.angle = angle;

            let x = recordDistance * Math.cos(angle);
            let y = 0;
            let z = recordDistance * Math.sin(angle);

            record.size = 200;

            record.position = new THREE.Vector3(x, y, z);

            record.originalIndex = i;

        }

        let geometryModel = new VOne.PreparedBufferGeometryModel(_data.length, _data);

        geometryModel.setPosition(e => e.position);
        geometryModel.setSize(e => e.size);
        geometryModel.setColor(e => new THREE.Color(`hsl(${ clusters[e.section] * 30 }, 100%, 50%)`));
        geometryModel.setAlpha(0.93);
        geometryModel.processRecords();

        let particles = new THREE.Points(geometryModel.getGeometry(), this.particlesMaterial);

        geometryModel.setMesh(particles);
        
        let geometry = new THREE.BufferGeometry();

        this.glScene.add(particles);



        let factory = new VOne.BufferGeometriesFactory();


        let facesGeometry = factory.build(clustersArray, {

            fromClass: THREE.RingBufferGeometry,
            usingArgs: [
                CONFIG.innerRadius - 20,
                CONFIG.outerRadius + 40,
                32,
                1,
                cluster => cluster.clusterIndex * dTheta,
                dThetaMinusHalfDegree

            ],
            setColor: cluster => new THREE.Color(`hsl(${ cluster.clusterIndex * 30 }, 100%, 50%)`),
            setAlpha: 0.6

        });


        let bottomFaces = new THREE.Mesh(facesGeometry.geometry, this.surfacesMaterial);
        bottomFaces.translateY(-CONFIG.modelHeight);

        bottomFaces.rotateX(VOne.HalfPI);


        this.glScene.add(bottomFaces);


        document.onkeydown = (event)=> {


            switch(event.keyCode){

                case 32: // Space bar

                break;


                case 27:    // ESC

                    if(this.selecting){

                        this.toggleSelection();

                    }

                break;


                case 13:    // Enter

                break;

            }

        }

    }




    clusterize(cb){

        let groupsCount = 30 + Math.ceil(Math.random() * 7);

        let recordsMap = [ ];
        this.groups  = [ ];


        for(let i = 0; i < groupsCount; i++){

            this.groups.push({ key: `SEP-02${i}2-${i}`,  values: [ ] });

        }


        $('#dashEscuelas .dashboard-item-value').text(this.groups.length);


        let groupStep = records.length / this.groups.length;


        for(let i = 0; i < records.length; i++){

            let g = Math.round(Math.random() * groupsCount) % groupsCount;

            recordsMap.push({ position: new THREE.Vector3(), recIndex: i });
            records[i].school = this.groups[g].key;
            this.groups[g].values.push(recordsMap[i]);

        }


        let radialDist = new VOne.RadialDistribution();

            radialDist.data(this.groups);

        let result = radialDist.generateDistribution({ distanceFromParent: 5700 });



        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];


        for(let i = 0; i < recordsMap.length; i++){

            indexesToAnimate.push(i);
            records[i].angle = recordsMap[i].angle;
            targets.push(new THREE.Vector3(recordsMap[i].position.x, recordsMap[i].position.y, Math.random() * this.zHeight));
            durations.push(Math.random() * 1100);

        }



        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});


        this.selectedRecords = [ Math.floor(Math.random() * records.length), Math.floor(Math.random() * records.length) ];


    }



    classifyByGender(cb){

        let mColor = new THREE.Color(0x58FAF4);
		let fColor = new THREE.Color(0xF781F3);

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            indexesToAnimate.push(i);
            targets.push(records[i].gender === 'male' ? mColor: fColor);
            durations.push(Math.random() * 900 + 100);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,
            onFinished: cb
		});

    }


    classifyByNotes(cb){

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            records[i].grades = 2 + Math.round(Math.random() * 3) + Math.round(Math.random() * 5);
            indexesToAnimate.push(i);
            targets.push(new THREE.Vector3(records[i].position.x, records[i].position.y, records[i].grades / 10 * this.zHeight));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});

    }



    classifyByAge(cb){

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            indexesToAnimate.push(i);
            targets.push(new THREE.Vector3(records[i].position.x, records[i].position.y, records[i].age / 19 * this.zHeight));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});

    }



    classifyByGrade(cb){

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            indexesToAnimate.push(i);
            targets.push(new THREE.Vector3(records[i].position.x, records[i].position.y, records[i].grade / 18 * this.zHeight));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});

    }



    classifyByPlatformUse(cb){

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            records[i].platformUse = Math.round(Math.random() * 3) + Math.round(Math.random() * 7);
            indexesToAnimate.push(i);
            targets.push(new THREE.Vector3(records[i].position.x, records[i].position.y, records[i].platformUse / 10 * this.zHeight));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});

    }



    classifyByAssistance(cb){

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            records[i].misses = Math.round(Math.random() * 12);
            indexesToAnimate.push(i);
            targets.push(new THREE.Vector3(records[i].position.x, records[i].position.y, records[i].misses / 12 * this.zHeight));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb
		});

    }


    selectRandomRecords(){

        let selectedSchoolsCount = Math.round(this.groups.length * (0.2 + Math.random() * 0.2));

        let selectedSchools = [ ];

        let selectedRecordsIndexes = [ ];


        while(selectedSchools.length < selectedSchoolsCount){

            let r = Math.round(Math.random() * (this.groups.length - 1));


            if(selectedSchools.indexOf(this.groups[r].key) === -1){

                selectedSchools.push(this.groups[r].key);

                let percentage = 7 + Math.random() * 5;
                let selectedRecordsCount = Math.round(this.groups[r].values.length * percentage / 100);

                let startIndex = Math.round(Math.random() * this.groups[r].values.length) % this.groups[r].values.length;


                for(let i = 0; i < selectedRecordsCount; i++){

                    selectedRecordsIndexes.push(this.groups[r].values[(i + startIndex) % this.groups[r].values.length].recIndex);

                }

            }

        }

        return selectedRecordsIndexes;

    }


    classifyBullying(direction, cb){

        let defaultColor = new THREE.Color(0xbbbbbb);
        let bullyColor = new THREE.Color(0x2efef7);
        let victimColor = new THREE.Color(0xfe2e2e);

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];


        let indexesToAnimateForPos = this.selectRandomRecords();
    	let targetsForPos = [ ];
    	let durationsForPos = [ ];


        let j = 0;

        for(let i = 0; i < indexesToAnimateForPos.length; i++){

            indexesToAnimate.push(indexesToAnimateForPos[i]);
            let duration = Math.random() * 900;



            // indexesToAnimateForPos.push(i);


            if(direction === 'ext'){

                let recordAngle = records[indexesToAnimateForPos[i]].angle * VOne.degToRad;

                targetsForPos.push(new THREE.Vector3(13800 * Math.cos(recordAngle), 13800 * Math.sin(recordAngle), records[indexesToAnimateForPos[i]].position.z));


            } else {

                targetsForPos.push(new THREE.Vector3(records[indexesToAnimateForPos[i]].position.x, records[indexesToAnimateForPos[i]].position.y, this.zHeight * 1.2))

            }


            durationsForPos.push(duration);


            j++;


            if(j % 10 === 0){

                targets.push(victimColor);
                records[indexesToAnimateForPos[i]].isAttacker = true;


            } else {

                targets.push(bullyColor);
                records[indexesToAnimateForPos[i]].isVictim = true;

            }


            durations.push(duration);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,

		});


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimateForPos,
			targets: targetsForPos,
			duration: durationsForPos,
			animationType: VOne.PositionAnimation,
            onFinished: cb(indexesToAnimateForPos.length)

		});


    }



    classifyDiscrimination(direction, cb){

        let defaultColor = new THREE.Color(0xbbbbbb);
        let bullyColor = new THREE.Color(0x2efef7);
        let victimColor = new THREE.Color(0xfe2e2e);

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];


        let indexesToAnimateForPos = this.selectRandomRecords();
    	let targetsForPos = [ ];
    	let durationsForPos = [ ];

        let j = 0;



        for(let i = 0; i < indexesToAnimateForPos.length; i++){

            indexesToAnimate.push(indexesToAnimateForPos[i]);

            let duration = Math.random() * 900;


            if(direction === 'ext'){

                let recordAngle = records[indexesToAnimateForPos[i]].angle * VOne.degToRad;
                targetsForPos.push(new THREE.Vector3(13800 * Math.cos(recordAngle), 13800 * Math.sin(recordAngle), records[i].position.z));


            } else {

                targetsForPos.push(new THREE.Vector3(records[indexesToAnimateForPos[i]].position.x, records[indexesToAnimateForPos[i]].position.y, this.zHeight * 1.2))

            }


            j++;


            if(j % 10 === 0){

                targets.push(victimColor);
                records[indexesToAnimateForPos[i]].isAttacker = true;

            } else {

                targets.push(bullyColor);
                records[indexesToAnimateForPos[i]].isVictim = true;

            }

            durations.push(duration);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,

		});


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimateForPos,
			targets: targetsForPos,
			duration: durationsForPos,
			animationType: VOne.PositionAnimation,
            onFinished: cb(indexesToAnimateForPos.length)
		});


    }




    extrudeSome(prop, val, cb){

        let indexesToAnimate = this.selectRandomRecords();
    	let targets = [ ];
    	let durations = [ ];


        for(let i = 0; i < indexesToAnimate.length; i++){


            let index = indexesToAnimate[i];

            let recordAngle = records[index].angle * VOne.degToRad;

            records[index][prop] = val ? val : true;
            targets.push(new THREE.Vector3(13800 * Math.cos(recordAngle), 13800 * Math.sin(recordAngle), records[i].position.z));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb(indexesToAnimate.length)
		});

    }



    depthSome(prop, val, cb){

        let indexesToAnimate = this.selectRandomRecords();
    	let targets = [ ];
    	let durations = [ ];


        for(let i = 0; i < indexesToAnimate.length; i++){

            let index = indexesToAnimate[i];

            records[index][prop] = val ? val : true;
            targets.push(new THREE.Vector3(records[index].position.x, records[index].position.y, this.zHeight * 1.2));
            durations.push(Math.random() * 1200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.PositionAnimation,
            onFinished: cb(indexesToAnimate.length)
		});

    }



    colorSome(prop, val, cb){

        let indexesToAnimate = this.selectRandomRecords();;
    	let targets = [ ];
    	let durations = [ ];


        let color = new THREE.Color(0xff00ff);

        for(let i = 0; i < indexesToAnimate.length; i++){

            let index = indexesToAnimate[i];

            records[index][prop] = val ? val : true;
            targets.push(color);
            durations.push(Math.random() * 1200 + 200);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,
            onFinished: cb(indexesToAnimate.length)
		});

    }



    restoreOriginalPositions(dir, cb){

        let defaultColor = new THREE.Color(0xbbbbbb);

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];


        let indexesToAnimateForPos = [ ];
    	let targetsForPos = [ ];
    	let durationsForPos = [ ];


        for(let i = 0; i < records.length;  i++){

            let duration = Math.random() * 400;

            indexesToAnimate.push(i);
            targets.push(defaultColor);
            durations.push(duration);

            let targetPos = new THREE.Vector3().copy(records[i].position);

            if(dir.indexOf('ext') >  -1){

                targetPos.setX(records[i].originalPosition.x);
                targetPos.setY(records[i].originalPosition.y);

            }

            if(dir.indexOf('depth') > -1){

                targetPos.setZ(records[i].originalPosition.z);

            }

            indexesToAnimateForPos.push(i);
            targetsForPos.push(targetPos);
            durationsForPos.push(duration);

        }



        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,

		});


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimateForPos,
			targets: targetsForPos,
			duration: durationsForPos,
			animationType: VOne.PositionAnimation,
            onFinished: cb

		});


        if(indexesToAnimate.length === 0){

            cb();

        }

    }




    restoreOriginalColors(cb){

        let defaultColor = new THREE.Color(0xbbbbbb);

        let indexesToAnimate = [ ];
    	let targets = [ ];
    	let durations = [ ];


        for(let i = 0; i < records.length;  i++){

            let duration = Math.random() * 400;

            indexesToAnimate.push(i);
            targets.push(defaultColor);
            durations.push(duration);

        }



        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexesToAnimate,
			targets: targets,
			duration: durations,
			animationType: VOne.ColorAnimation,
            onFinished: cb
		});


        if(indexesToAnimate.length === 0){

            cb();

        }

    }




    emulateSeach(strLength, cb){

        let percent = strLength < 8 ? (92 + strLength) / 100 : 1;

        let indexes = [ ];
        let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < Math.floor(records.length * percent); i++){

            if(i !== this.selectedRecords[0] && i !== this.selectedRecords[1]){

                indexes.push(i);
                targets.push(0.15);
                durations.push(Math.random() * 200);

            }

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexes,
			targets: targets,
			duration: durations,
			animationType: VOne.AlphaAnimation,
            onFinished: cb
		});

    }


    focusOnSearch(){

        let recIndex = this.selectedRecords[0];

        let controls = this.glScene.controls;

        let start = { x: controls.target.x, y: controls.target.y, z: controls.target.z  };
        let end = { x: records[recIndex].position.x, y: records[recIndex].position.y, z: records[recIndex].position.z };


        let tween = new TWEEN.Tween(start)
            .to(end, 500)
            .onUpdate((o) => {

                controls.target.set(o.x, o.y, o.z);

            })
            .onComplete(e => {

            });


        tween.start();

    }


    clearSearch(cb){

        let indexes = [ ];
        let targets = [ ];
    	let durations = [ ];

        for(let i = 0; i < records.length; i++){

            indexes.push(i);
            targets.push(0.95);
            durations.push(Math.random() * 300);

        }


        this.animationEngine.pointsAnimation(this.geometryModel, {
			indexes: indexes,
			targets: targets,
			duration: durations,
			animationType: VOne.AlphaAnimation,
            onFinished: cb
		});


        let start = { x: this.glScene.controls.target.x, y: this.glScene.controls.target.y, z: this.glScene.controls.target.z  };
        let end = { x: 0, y: 0, z: 0 };

        let tween = new TWEEN.Tween(start)
            .to(end, 500)
            .onUpdate((o) => {

                this.glScene.controls.target.set(o.x, o.y, o.z);

            })
            .onComplete(e => {

            });


        tween.start();

    }



    toggleSelection(){

        this.selecting = !this.selecting;

        if(this.selecting){

            this.selection.startSelectionMode(this.geometryModel, this.displaySelection);
            $('#toggleSelectionBtn').addClass('active');

        } else {

            this.selection.deactivateSelectionMode();
            this.geometryModel.alphaArray.fill(0.95);
            this.geometryModel.geometry.attributes.alpha.needsUpdate = true;

            $('#toggleSelectionBtn').removeClass('active');
            $('#selectionDiv').hide();

        }

    }



    displaySelection(selection){


        visualization.geometryModel.alphaArray.fill(0.25);

        selectionList = ``;

        selection.records.forEach((record, index) => {

            visualization.geometryModel.alphaArray[record.index] = 1.0;

				if(index < 60)
				selectionList += `<span class="dataField">${ record.record.name }</span>-<span class="dataField">${record.record.school}</span><br/>`;

        });

        selectionList += `<p>${ selection.records.length > 60 ? '...<br/>' : '' }${ selection.records.length * GLOBAL_MULTIPLIER } alumnos seleccionados. <a href="#">Exportar</a></p>`

        visualization.geometryModel.geometry.attributes.alpha.needsUpdate = true;

        $('#selectionDiv').html(selectionList);

        $('#selectionDiv').show();

    }


    displayInfoDiv(record, index) {

        if(!this.selecting){

            let htmlContents = `
                <div class="row" style="border-bottom: solid 1px #ccc;">

                    <div class="col-sm-4">
                        <img src="images/${ record.gender === 'male' ? 'maleChild' : 'femaleChild' }.png" style="width: 100%; margin-top: 0.2rem;">
                    </div>
                    <div class="col-sm-8">
                        <center><span class="small-text">-- ${ record.school ? 'Escuela ' + record.school : '' } --</span></center><br/>
                        <span class="small-text">Alumno: </span><strong>${ record.name }</strong> <br/>
                        <span class="small-text">Tel&eacute;fono: </span><strong>${ record.phone }</strong><br/>
                        <strong>${ record.gradeDescription ? record.gradeDescription : '' }</strong></br>
                        <span class="small-text">${ record.age } a&ntilde;os</span>
                    </div>
                </div>

                ${ record.misses !== undefined ? '<span class="small-text">Inasistencias en el per&iacute;odo: </span><strong>' + record.misses + '</strong><br/>' : '' }
                ${ record.grades !== undefined ? '<span class="small-text">Promedio: </span><strong>' + numberFormat(record.grades < 10 ? record.grades + Math.random() : 10, 1) + '</strong><br/>' : '' }
                ${ record.isVictim !== undefined ? '<span class="small-text">Bullying/Discriminaci&oacute;n: </span><strong>' + (record.isVictim ? 'V&iacute;ctima</strong><br/>' : '') : '' }
                ${ record.isAttacker !== undefined ? '<span class="small-text">Bullying/Discriminaci&oacute;n: </span><strong class="text-danger">' + (record.isAttacker ? 'Agresor' : '') + '</strong><br/>' : '' }
                ${ record.hasAddictions !== undefined ? '<span class="small-text text-success"><strong>-- REPORTE DE ADICCION --</strong></span><br/> ' : '' }
                ${ record.platformUse !== undefined ? '<span class="small-text">Uso de pataforma: </span><strong>' + record.platformUse + '/10</strong><br/>' : '' }
                ${ record.violenceReport !== undefined ? '<span class="small-text text-warning"><strong>-- REPORTE DE VIOLENCIA --</strong></span><br/>' : '' }
                ${ record.vulnerable !== undefined ? '<span class="small-text text-important"><strong>-- REPORTE DE VULNERABILIDAD: ' + record.vulnerable + ' --</strong></span><br/>' : '' }
            `;

            $('#infoDiv').html(htmlContents);

            positionInfoDiv('infoDiv', this.glScene, { });

            $('#infoDiv').show();

        }



    };

}





const initVisualization = () => {

    console.log('Initializing visualization.');

    visualization = new Visualization();

}
