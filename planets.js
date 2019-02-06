
Qt.include("three.js")
Qt.include("threex.planets.js")

var SUN = 0;
var EARTH = 1;
var MARS = 2;
var NEPTUNE = 3;
var MOON = 4;
var SOLAR_SYSTEM = 100;
var NUM_SELECTABLE_PLANETS = 4;

var camera, scene, renderer;
var camera1;
var planetCanvas, mouse, raycaster;

var lookAtOffset;
var daysPerFrame;
var daysPerFrameScale;
var planetScale;
var cameraDistance;

var objects = []; // Planet objects
var hitObjects = []; // Planet hit detection objects
var planets = []; // Planet data info

var commonGeometry;
var hitGeometry;
var solarDistance = 2600000;

var qmlView;

var oldFocusedPlanetPosition;
var oldCameraPosition;
var defaultCameraPosition;
var privet;

var y = 2000;
var m = 1;
var D = 1;

var startD = 367 * y - 7 * (y + (m + 9) / 12) / 4 + 275 * m / 9 + D - 730530;
var oldTimeD = startD;
var currTimeD = startD;

var auScale = 149597.870700; // AU in thousands of kilometers

var focusedScaling = false;
var focusedMinimumScale = 20;
var actualScale;

var helper;
var light;
var light2;
var light3, light4, light5;
var helper3, helper4, helper5;

var x0 = 0.1;
var y0 = 0.1;
var z0 = 0.1;
var x0p = 0.01;
var y0p = 0.01;
var z0p = 0.01;

function initializeGL(canvas, eventSource, mainView) {

    planetCanvas = canvas;
    qmlView = mainView;
    //privet =
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 2500000, 20000000);
    defaultCameraPosition = new THREE.Vector3(solarDistance, solarDistance, solarDistance);
    //camera.position.set(defaultCameraPosition.x, defaultCameraPosition.y, defaultCameraPosition.z);
    //camera.position.set(auScale, auScale, auScale);
    scene = new THREE.Scene();

    var starSphere = THREEx.Planets.createStarfield(8500000);
    //var starSphere = createStarfield(8500000);
    scene.add(starSphere);

    renderer = new THREE.Canvas3DRenderer(
                { canvas: canvas, antialias: true, devicePixelRatio: canvas.devicePixelRatio });

    //renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //renderer.physicallyCorrectLights = true;
    //renderer.setPixelRatio(canvas.devicePixelRatio);
    //renderer.shadowMap.autoUpdate = true;
    renderer.setSize(canvas.width, canvas.height);
    //! [5]
    eventSource.mouseDown.connect(onDocumentMouseDown);
    //! [5]

    light = new THREE.PointLight(0xFFFF00, 1);//SUN
    light.position.set(0, 0, 0);
    //light.castShadow = true; //mine
    scene.add(light);


    light2 = new THREE.SpotLight(0x0000FF, 1, 0, (Math.PI/2)*45/180); //EARTH
    light2.position.set(0, 0, 0);
    //light2.castShadow = true;
    //light2.position.set(0, 50000, 0);
    //light2.target = objects[SUN];
    scene.add(light2);
    helper = new THREE.SpotLightHelper( light2 );
    scene.add( helper );


    light3 = new THREE.SpotLight(0x0000FF, 1, 0, (Math.PI/2)*5/180);//MARS
    light3.position.set(0, 0, 0);
    scene.add(light3);
    helper3 = new THREE.SpotLightHelper( light3 );
    scene.add( helper3 );


    light4 = new THREE.SpotLight(0x0000FF, 1, 0, (Math.PI/2)*5/180);//NEPTUNE
    light4.position.set(0, 0, 0);
    scene.add(light4);
    helper4 = new THREE.SpotLightHelper( light4 );
    scene.add( helper4 );

    light5 = new THREE.SpotLight(0x0000FF, 2, 0, (Math.PI/2)*5/180);//MOON
    light5.position.set(0, 0, 0);
    scene.add(light5);
    helper5 = new THREE.SpotLightHelper( light5 );
    //scene.add( helper5 );








    scene.add(new THREE.AmbientLight(0x111111));

    loadPlanetData();
    createPlanets();
    setScale(1200);

    camera.lookAt(objects[0].position); // look at the Sun

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();



    camera.position = objects[MARS];

}

function loadPlanetData() {

    // Planet Data
    // radius - planet radius in millions of meters
    // tilt - planet axis angle
    // N1 N2 - longitude of the ascending node
    // i1 i2 - inclination to the ecliptic (plane of the Earth's orbit)
    // w1 w2 - argument of perihelion
    // a1 a2 - semi-major axis, or mean distance from Sun
    // e1 e2 - eccentricity (0=circle, 0-1=ellipse, 1=parabola)
    // M1 M2 - mean anomaly (0 at perihelion; increases uniformly with time)
    // period - sidereal rotation period
    // centerOfOrbit - the planet in the center of the orbit


    var sun = { radius: 694.439, tilt: 63.87, period: 25.05 };
    planets.push(sun);

    var earth = {
        radius: 6.371, tilt: 25.44, N1: 174.873, N2: 0,
        i1: 0.00005, i2: 0, w1: 102.94719, w2: 0,
        a1: 0*0.25 + 1, a2: 0, e1: 0.01671022, e2: 0,
        M1: 357.529, M2: 0.985608, period: 0.997,
        centerOfOrbit: SUN
    };
    planets.push(earth);
    var mars = {
        radius: 0.75 + 0 * 3.389372, tilt: 25.19, N1: 49.5574, N2: 0.0000211081,
        i1: 1.8497, i2: -0.0000000178, w1: 286.5016, w2: 0.0000292961,
        a1: 0.1*1.523688, a2: 0, e1: 0.093405, e2: 0.000000002516,
        M1: 18.6021, M2: 1000*0.5240207766, period: 1.025957,
        centerOfOrbit: EARTH
    };
    planets.push(mars);


    var neptune = {
        radius: 0.5 + 0*24.73859, tilt: 28.32, N1: 0*131.7806, N2: 0.000030173,
        i1: 1.7700, i2: -0.000000255, w1: 272.8461, w2: 0.000006027,
        a1: 30.05826, a2: 0.00000003313, e1: 0.008606, e2: 0.00000000215,
        M1: 260.2471, M2: 10*0.005995147, period: 0.6713,
        centerOfOrbit: MARS
    };
    planets.push(neptune);
    var moon = {
        radius: 1.5424, tilt: 28.32, N1: 125.1228, N2: -0.0529538083,
        i1: 5.1454, i2: 0, w1: 318.0634, w2: 0.1643573223,
        a1: 0.273, a2: 0, e1: 0.054900, e2: 0,
        M1: 115.3654, M2: 13.0649929509, period: 27.321582,
        centerOfOrbit: EARTH
    };
    planets.push(moon);

}

function createPlanets() {

    objects = [];

    commonGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(1, 64, 64));
    hitGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(1, 8, 8));

    //var ringSegments = 70;
//    var mesh, innerRadius, outerRadius, ring;
    var mesh;
    for (var i = 0; i < planets.length; i ++) {
        switch (i) {
        case SUN:
            mesh = createSun(planets[i]["radius"]);
            mesh.position.set(0, 0, 0);
            break;

        case EARTH:
            mesh = createPlanet(planets[i]["radius"], 0.05, 'images/earthmap1k.jpg',
                                'images/earthbump1k.jpg', 'images/earthspec1k.jpg');
            createEarthCloud(mesh);


//            var mesh1 = createPlanet(planets[MOON]["radius"], 0.05, 'images/moonmap1k.jpg', 'images/moonbump1k.jpg');
  //          mesh1.receiveShadow = true;
    //        mesh1.castShadow = true;
            //mesh.add(mesh1);
            //objects.push(mesh1);
            //scene.add(mesh1);
            break;
        case MARS:
//            mesh = createPlanet(planets[i]["radius"], 0.05, 'images/marsmap1k.jpg',
//                                'images/marsbump1k.jpg');
            var material = new THREE.MeshPhongMaterial({wireframe:false, transparent: true, opacity: 0});
            //var material = new THREE.MeshStandardMaterial();
            mesh = new THREE.Mesh(commonGeometry, material);
            //mesh.receiveShadow = true;
            //mesh.castShadow = true;
         //   mesh.scale.set(planets[i]["radius"], planets[i]["radius"], planets[i]["radius"]);
            break;

        case NEPTUNE:
            //mesh = createPlanet(planets[i]["radius"], 0.05, 'images/neptunemap.jpg',
            //                    'images/neptunemap.jpg');
            material = new THREE.MeshPhongMaterial({transparent: true});
            //var material = new THREE.MeshStandardMaterial();
            mesh = new THREE.Mesh(commonGeometry, material);
            break;
        case MOON:
//            mesh = createPlanet(planets[i]["radius"], 0.05, 'images/moonmap1k.jpg',
//                                'images/moonbump1k.jpg');
            material = new THREE.MeshPhongMaterial({transparent: true, opacity: 0});
            mesh = new THREE.Mesh(commonGeometry, material);
            //mesh.add(mesh);
            break;
        }

        objects.push(mesh);
        scene.add(mesh);

        // Create separate meshes for click detection
        var hitMesh = new THREE.Mesh(hitGeometry);
        hitMesh.visible = false;
        hitObjects.push(hitMesh);
        scene.add(hitMesh);
    }


}

function createSun(radius) {

    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('images/sunmap.jpg');
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(commonGeometry, material);
    mesh.scale.set(radius, radius, radius);

    mesh.receiveShadow = false;
    mesh.castShadow = false;

    return mesh;
}

function createPlanet(radius, bumpMapScale, mapTexture, bumpTexture, specularTexture) {

    var textureLoader = new THREE.TextureLoader();
   var material = new THREE.MeshPhongMaterial({
                                                   map: textureLoader.load(mapTexture),
                                                   bumpMap: textureLoader.load(bumpTexture),
                                                   bumpScale: bumpMapScale,
                                                   wireframe: false
                                                 });
   // var material = new THREE.MeshStandardMaterial();
    if (specularTexture) {
        material.specularMap = textureLoader.load(specularTexture);
        material.specular = new THREE.Color('grey');
        material.shininess = 50.0;
    } else {
        material.shininess = 1.0;
    }

    var mesh = new THREE.Mesh(commonGeometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.set(radius, radius, radius);

    return mesh;

}

function createEarthCloud(earthMesh) {

    var textureLoader = new THREE.TextureLoader();
    var material = new THREE.MeshPhongMaterial({
                                                   map: textureLoader.load('qrc:images/earthcloudmapcolortrans.png'),
                                                   side: THREE.BackSide,
                                                   transparent: true,
                                                   opacity: 0.8
                                               });
    var mesh = new THREE.Mesh(commonGeometry, material);

    var material2 = new THREE.MeshPhongMaterial({
                                                   map: textureLoader.load('qrc:images/earthcloudmapcolortrans.png'),
                                                   side: THREE.FrontSide,
                                                   transparent: true,
                                                   opacity: 0.8
                                               });
    var mesh2 = new THREE.Mesh(commonGeometry, material2);

    mesh.scale.set(1.02, 1.02, 1.02);
    earthMesh.add(mesh);
    mesh2.scale.set(1.02, 1.02, 1.02);
    earthMesh.add(mesh2);
}


function createStarfield(radius) {

    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('images/galaxy_starfield.png')
    var material = new THREE.MeshBasicMaterial({
                                                   map: texture,
                                                   side: THREE.BackSide
                                               })
    var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(radius, 32, 32));
    var mesh = new THREE.Mesh(geometry, material)

    return mesh

}

function onResizeGL(canvas) {

    if (camera === undefined) return;

    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(canvas.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

}

function onSpeedChanged(value) {

    daysPerFrameScale = value;

}

function setScale(value, focused) {

    // Save actual scale in focus mode
    if (!focused)
        actualScale = value;

    // Limit minimum scaling in focus mode to avoid jitter caused by rounding errors
    if (value <= focusedMinimumScale && (focusedScaling || focused)) {
        planetScale = focusedMinimumScale;
    } else {
        planetScale = actualScale;
    }
    //confirm("1");
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        // first reset scale
        var radius = planets[i]["radius"];
        object.scale.set(radius, radius, radius);
        if (i === SUN) {
            object.scale.multiplyScalar(planetScale / 100);
        } else {
            object.scale.multiplyScalar(planetScale);
        }
        hitObjects[i].scale.set(object.scale.x, object.scale.y, object.scale.z);
    }

}

function prepareFocusedPlanetAnimation() {

    oldCameraPosition = camera.position.clone();

    var planet = SUN;
    if (qmlView.oldPlanet !== SOLAR_SYSTEM)
        planet = qmlView.oldPlanet;
    oldFocusedPlanetPosition = objects[planet].position.clone();
    qmlView.oldPlanet = qmlView.focusedPlanet;

    if (qmlView.focusedPlanet !== SOLAR_SYSTEM && actualScale <= focusedMinimumScale) {
        // Limit minimum scaling in focus mode to avoid jitter caused by rounding errors
        planetScale = focusedMinimumScale;
        setScale(focusedMinimumScale, true);
        focusedScaling = true;
    } else if (focusedScaling === true) {
        // Restore normal scaling
        focusedScaling = false;
        setScale(actualScale);
    }

    calculateLookAtOffset();
    calculateCameraOffset();

}

function setCameraDistance(distance) {

    cameraDistance = distance;

}
function setCameraDirection(x) {
  //  if (qmlView.focusedPlanet === MARS) {
        lookAtOffset = new THREE.Vector3(150000*x, 0, 0);
    //}
}
function setCameraAngle(alpha) {
    camera.fov = 180/Math.PI*alpha;
}

function setX0_Position(distance) {
    x0 = 0.01*distance;
}
function setY0_Position(distance) {
    y0 = 0.01*distance;
}
function setZ0_Position(distance) {
    z0 = 0.01*distance;
}
function setX0P_Position(distance) {
    x0p = 0.01*distance;
}
function setY0P_Position(distance) {
    y0p = 0.01*distance;
}
function setZ0P_Position(distance) {
    z0p = 0.01*distance;
}
function calculateLookAtOffset() {

    var offset = oldFocusedPlanetPosition.clone();

    var planet = 0;
    if (qmlView.focusedPlanet !== SOLAR_SYSTEM)
        planet = qmlView.oldPlanet;

    var focusedPlanetPosition = objects[planet].position.clone();
    offset.sub(focusedPlanetPosition);

    qmlView.xLookAtOffset = offset.x;
    qmlView.yLookAtOffset = offset.y;
    qmlView.zLookAtOffset = offset.z;

}

function calculateCameraOffset() {

    var offset = oldCameraPosition.clone();

    var planet = 0;
    if (qmlView.focusedPlanet !== SOLAR_SYSTEM)
        planet = qmlView.focusedPlanet;

    var newCameraPosition = getNewCameraPosition(getOuterRadius(planet));

    if (qmlView.focusedPlanet !== SUN)
        offset.sub(newCameraPosition);

    if (qmlView.focusedPlanet === SUN && qmlView.oldPlanet === SOLAR_SYSTEM) {
        qmlView.xCameraOffset = Math.abs(offset.x);
        qmlView.yCameraOffset = Math.abs(offset.y);
        qmlView.zCameraOffset = Math.abs(offset.z);
    } else /*(qmlView.focusedPlanet === MARS && qmlView.oldPlanet === EARTH)*/ {
        qmlView.xCameraOffset = 1;
        qmlView.yCameraOffset = 1;
        qmlView.zCameraOffset = 1;
    }
    /*else { // from a planet to another
        qmlView.xCameraOffset = offset.x;
        qmlView.yCameraOffset = offset.y;
        qmlView.zCameraOffset = offset.z;
    }*/

}

function getNewCameraPosition( radius ) {

    var position;
    if (qmlView.focusedPlanet === SOLAR_SYSTEM) {
        position = defaultCameraPosition.clone();
        position.multiplyScalar(cameraDistance);
    } else if (qmlView.focusedPlanet === SUN) {
        position = new THREE.Vector3(radius * planetScale * 2,
                                     radius * planetScale * 2,
                                     radius * planetScale * 2);
        position.multiplyScalar(cameraDistance);

    }
    else {
        var vec1 = objects[qmlView.focusedPlanet].position.clone();
        var vec2 = new THREE.Vector3(0, 1, 0);
        vec1.normalize();
        vec2.cross(vec1);
        vec2.multiplyScalar(radius * planetScale * cameraDistance * 4);
        vec2.add(objects[qmlView.focusedPlanet].position);
        vec1.set(0, radius * planetScale, 0);
        vec2.add(vec1);
        position = vec2;
    }

    return position;
}

function onDocumentMouseDown(x, y) {

    // Mouse selection for planets and Solar system, not for the Moon.
    // Intersection tests are done against a set of cruder hit objects instead of
    // actual planet meshes, as checking a lot of faces can be slow.
    mouse.set((x / planetCanvas.width) * 2 - 1, - (y / planetCanvas.height ) * 2 + 1);

    raycaster.setFromCamera(mouse, camera);

    var intersects = [];
    var i = 0;
    var objectCount = hitObjects.length - 1; // -1 excludes the moon, which is the last object
    while (i < objectCount) {
        // Update hitObject position
        var objectPos = objects[i].position;
        var hitObject = hitObjects[i];
        hitObject.position.set(objectPos.x, objectPos.y, objectPos.z);
        hitObject.updateMatrixWorld();

        hitObject.raycast( raycaster, intersects );

        i++;
    }
    intersects.sort( raycaster.ascSort );

    var selectedPlanet;

    if (intersects.length > 0) {
        var intersect = intersects[0];

        i = 0;
        while (i < objectCount) {
            if (intersect.object === hitObjects[i]) {
                selectedPlanet = i;
                break;
            }
            i++;
        }
        if (selectedPlanet < NUM_SELECTABLE_PLANETS) {
            qmlView.focusedPlanet = selectedPlanet;
            // Limit minimum scaling in focus mode to avoid jitter caused by rounding errors
            if (actualScale <= focusedMinimumScale) {
                planetScale = focusedMinimumScale;
                setScale(focusedMinimumScale, true);
            }
            focusedScaling = true;
        }
    } else {
        qmlView.focusedPlanet = SOLAR_SYSTEM;
        // Restore normal scaling
        if (focusedScaling === true) {
            focusedScaling = false;
            setScale(actualScale);
        }
    }

}

function paintGL(canvas) {

    if (qmlView.focusedPlanet === SOLAR_SYSTEM)
        daysPerFrame = daysPerFrameScale * 10;
    else
        daysPerFrame = daysPerFrameScale * planets[qmlView.focusedPlanet]["period"] / 100;

    // Advance the time in days
    oldTimeD = currTimeD;
    currTimeD = currTimeD + daysPerFrame;
    var deltaTimeD = currTimeD - oldTimeD;

    // Position the planets orbiting the sun
    for (var i = 1; i < objects.length; i ++) {
        var object = objects[i];
        var planet = planets[i];

        // Planet Data
    // radius - planet radius in millions of meters
    // tilt - planet axis angle
    // N1 N2 - longitude of the ascending node
    // i1 i2 - inclination to the ecliptic (plane of the Earth's orbit)
    // w1 w2 - argument of perihelion
    // a1 a2 - semi-major axis, or mean distance from Sun
    // e1 e2 - eccentricity (0=circle, 0-1=ellipse, 1=parabola)
    // M1 M2 - mean anomaly (0 at perihelion; increases uniformly with time)
    // period - sidereal rotation period
    // centerOfOrbit - the planet in the center of the orbit
        if (i == MOON)
            object.material.bumpScale = 0.03 * planetScale;
        else
            object.material.bumpScale = 0.3 * planetScale;

        // Calculate the planet orbital elements from the current time in days
        var N =  (planet["N1"] + planet["N2"] * currTimeD) * Math.PI / 180;
        var iPlanet = (planet["i1"] + planet["i2"] * currTimeD) * Math.PI / 180;
        var w =  (planet["w1"] + planet["w2"] * currTimeD) * Math.PI / 180;
        var a = planet["a1"] + planet["a2"] * currTimeD;
        var e = planet["e1"] + planet["e2"] * currTimeD;
        var M = (planet["M1"] + planet["M2"] * currTimeD) * Math.PI / 180;
        var E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));

        var xv = a * (Math.cos(E) - e);
        var yv = a * (Math.sqrt(1.0 - e * e) * Math.sin(E));

        var v = Math.atan2(yv, xv);

        // Calculate the distance (radius)
        var r = Math.sqrt(xv * xv + yv * yv);

        // From http://www.davidcolarusso.com/astro/
        // Modified to compensate for the right handed coordinate system of OpenGL
    var xh, yh, zh;
    if (i === NEPTUNE) {
        //var x0 = 0.1;
       // var y0 = 0.1;
       // var z0 = 0.1;
        //var x0p = 0.01;
       // var y0p = 0.01;
       // var z0p = 0.01;
        var t = currTimeD;
        xh = x0 + y0*6*(M - Math.sin(10000.0*M)) + x0p*(4*Math.sin(10000.0*M) - 3*M) + 2*y0p*(1 - Math.cos(10000.0*M));
        yh = y0*(4 - 3*Math.cos(10000.0*M)) + y0p*Math.sin(10000.0*M) - 2*x0p*(1 - Math.cos(10000.0*M));
        zh = z0*Math.cos(10000.0*M) + z0p*Math.sin(10000.0*M);
        xh *= 0.02;
        yh *= 0.02;
        zh *= 0.02;
    }

    else {
        xh = r * (Math.cos(N) * Math.cos(v + w)
                      - Math.sin(N) * Math.sin(v + w) * Math.cos(iPlanet));
        zh = -r * (Math.sin(N) * Math.cos(v + w)
                       + Math.cos(N) * Math.sin(v + w) * Math.cos(iPlanet));
        yh = r * (Math.sin(w + v) * Math.sin(iPlanet));

        if (i === MARS) {
           // light2.angle = 2*180/Math.PI*Math.asin(planets[EARTH]["radius"]/Math.sqrt(xh*xh + yh*yh + zh*zh)/auScale);
        }
    }
        // Apply the position offset from the center of orbit to the bodies
        var centerOfOrbit = objects[planet["centerOfOrbit"]];
        object.position.set(centerOfOrbit.position.x + xh * auScale,
                            centerOfOrbit.position.y + yh * auScale,
                            centerOfOrbit.position.z + zh * auScale);
        if (i === MARS) {
            //camera1.position.set(centerOfOrbit.position.x, centerOfOrbit.position.y, centerOfOrbit.position.z);                            //////////////////////////////////////////////
            //camera.updateProjectionMatrix();
        }
        // Calculate and apply the appropriate axis tilt to the bodies
        // and rotate them around the axis
        var radians = planet["tilt"] * Math.PI / 180; // tilt in radians
        object.rotation.order = 'ZXY';
        object.rotation.x = 0;
        object.rotation.y += (deltaTimeD / planet["period"]) * 2 * Math.PI;
        object.rotation.z = radians;


    }

    // rotate the Sun
    var sun = objects[SUN];
    sun.rotation.order = 'ZXY';
    sun.rotation.x = 0;
    sun.rotation.y += (deltaTimeD / planets[SUN]["period"]) * 2 * Math.PI;
    sun.rotation.z = planets[SUN]["tilt"] * Math.PI / 180; // tilt in radians

    // calculate the outer radius of the focused item
    var outerRadius = getOuterRadius(qmlView.focusedPlanet);

    // get the appropriate near plane position for the camera and animate it with QML animations
    qmlView.cameraNear = outerRadius;

    camera.near = qmlView.cameraNear;
    camera.updateProjectionMatrix();

    // Calculate and set camera position
    var cameraPosition = getNewCameraPosition(outerRadius);
    var cameraOffset = new THREE.Vector3(qmlView.xCameraOffset,
                                         qmlView.yCameraOffset,
                                         qmlView.zCameraOffset);
    cameraPosition.add(cameraOffset);

    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    var cameraLookAt
    // Calculate and set camera look-at point
    if (qmlView.focusedPlanet === MARS) {
        cameraLookAt = new THREE.Vector3(1,1,1);
        cameraLookAt.add(lookAtOffset);
        camera.lookAt(cameraLookAt);

    } else {
        var lookAtPlanet = SUN;
        if (qmlView.focusedPlanet !== SOLAR_SYSTEM)
            lookAtPlanet = qmlView.focusedPlanet;
        cameraLookAt = objects[lookAtPlanet].position.clone();
        lookAtOffset = new THREE.Vector3(qmlView.xLookAtOffset,
                                             qmlView.yLookAtOffset,
                                             qmlView.zLookAtOffset);
        cameraLookAt.add(lookAtOffset);
        camera.lookAt(cameraLookAt);
    }



/*/    var cameraLookAt1 = objects[EARTH].position.clone();
    var lookAtOffset1 = new THREE.Vector3(qmlView.xLookAtOffset,
                                         qmlView.yLookAtOffset,
                                         qmlView.zLookAtOffset);
    cameraLookAt1.add(lookAtOffset1);
    helper.camera.lookAt(cameraLookAt1);
    helper.update();

*/
    light2.position.set(objects[EARTH].position.x, objects[EARTH].position.y, objects[EARTH].position.z); //EARTH
    light2.target.position.set(2*objects[EARTH].position.x, 2*objects[EARTH].position.y, 2*objects[EARTH].position.z);

    scene.add( light2.target );
    helper.update();

    light3.position.set(objects[MARS].position.x, objects[MARS].position.y, objects[MARS].position.z);  //MARS
    light3.target.position.set(2*objects[MARS].position.x, 2*objects[MARS].position.y, 2*objects[MARS].position.z);
    scene.add( light3.target );
    helper3.update();

    light4.position.set(objects[NEPTUNE].position.x, objects[NEPTUNE].position.y, objects[NEPTUNE].position.z); //NEPTUNE
    light4.target.position.set(2*objects[NEPTUNE].position.x, 2*objects[NEPTUNE].position.y, 2*objects[NEPTUNE].position.z);
    scene.add( light4.target );
    helper4.update();

   // light5.position.set(objects[MOON].position.x, objects[MOON].position.y, objects[MOON].position.z); //MOON
   // light5.target.position.set(2*objects[MOON].position.x, 2*objects[MOON].position.y, 2*objects[MOON].position.z);
   // scene.add( light5.target );
   // helper5.update();

    // Render the scene
    renderer.render(scene, camera);

}

function getOuterRadius( planet ) {

    var outerRadius = solarDistance;
    if (planet !== SOLAR_SYSTEM) {
        outerRadius = planets[planet]["radius"];

        if (planet === SUN) outerRadius = planets[planet]["radius"] / 100;
    }

    return outerRadius;
}
