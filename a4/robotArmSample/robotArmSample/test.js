"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)
var NumCylSides = 36;

var points = [];
var cylpoints = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var cylinderp = [];
var cylinderv = [];
var cylinderc = [];
var cylindernorms = [];



// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 0.5;
var BASE_WIDTH       = 0.5;
var LOWER_ARM_HEIGHT = 2.0;
var LOWER_ARM_WIDTH  = 0.3;
var UPPER_ARM_HEIGHT = 2.0;
var UPPER_ARM_WIDTH  = 0.3;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;


var theta= [ -60, -60, -50];
var sun = [-1.5, 2, 3];
var checked;

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer, nBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}

function cylinderquad(a, b, c, d){
  cylinderp.push(cylinderv[a]);
  cylinderp.push(cylinderv[b]);
  cylinderp.push(cylinderv[c]);
  cylinderp.push(cylinderv[a]);
  cylinderp.push(cylinderv[c]);
  cylinderp.push(cylinderv[d]);
  cylindernorms.push(cylinderv[a]);
  cylindernorms.push(cylinderv[b]);
  cylindernorms.push(cylinderv[c]);
  cylindernorms.push(cylinderv[a]);
  cylindernorms.push(cylinderv[c]);
  cylindernorms.push(cylinderv[d]);
}

function initColors(n, r, g, b){
  for(var i=0;i<n;i++){
    cylinderc.push(vec4(r,g,b,1));
  }
}

function initCylinderVertices(n){
  let angle = 0;
  let inc = Math.PI*2/n;
  for(var i=0;i<n;i++){
    cylinderv.push(vec4(Math.cos(angle)/2, 0.5, Math.sin(angle)/2, 1));
    angle += inc;
  }
  angle = 0;
  for(var i=0;i<n;i++){
    cylinderv.push(vec4(Math.cos(angle)/2, -0.5, Math.sin(angle)/2, 1));
    angle += inc;
  }
}

function initCylinder(n) {
  for(var i=0;i<n-1;i++){
    cylinderquad(i,i+1,i+n+1,i+n);
  }
  cylinderquad(n-1,0,n,2*n-1);
  for(var i=0;i<n-1;i++){
    cylinderp.push(vec4(0,0.5,0,1));
    cylinderp.push(cylinderv[i]);
    cylinderp.push(cylinderv[i+1]);
    cylindernorms.push(vec4(0,1,0,1));
    cylindernorms.push(vec4(0,1,0,1));
    cylindernorms.push(vec4(0,1,0,1));
  }
  cylinderp.push(vec4(0,0.5,0,1));
  cylinderp.push(cylinderv[n-1]);
  cylinderp.push(cylinderv[0]);
  cylindernorms.push(vec4(0,1,0,1));
  cylindernorms.push(vec4(0,1,0,1));
  cylindernorms.push(vec4(0,1,0,1));
  for(var i=0;i<n-1;i++){
    cylinderp.push(vec4(0,-0.5,0,1));
    cylinderp.push(cylinderv[n+i]);
    cylinderp.push(cylinderv[n+i+1]);
    cylindernorms.push(vec4(0,-1,0,1));
    cylindernorms.push(vec4(0,-1,0,1));
    cylindernorms.push(vec4(0,-1,0,1));
  }
  cylinderp.push(vec4(0,-0.5,0,1));
  cylinderp.push(cylinderv[2*n-1]);
  cylinderp.push(cylinderv[n]);
  cylindernorms.push(vec4(0,-1,0,1));
  cylindernorms.push(vec4(0,-1,0,1));
  cylindernorms.push(vec4(0,-1,0,1));
}

function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    // colorCube();
    colorCube();

    initCylinderVertices(36);
    initCylinder(NumCylSides);
    initColors(NumCylSides*6, 1, 0, 0);
    initColors(NumCylSides*3, 0, 1, 0);
    initColors(NumCylSides*3, 0, 0, 1);

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cylindernorms), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    document.getElementById("slider1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").onchange = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[2] =  event.target.value;
    };
    document.getElementById("toggle").onclick = function(event) {
        checked = event.target.checked;
        document.getElementById("viewText").innerHTML = "Side View";
        if(checked){
          document.getElementById("viewText").innerHTML = "Top View";
        }
    }

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    var lightPosition = vec4(sun[0],sun[1],sun[2],1);
    var lightColor = vec4(1,1,1,1);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightColor"), flatten(lightColor) );



    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cylinderp), gl.STATIC_DRAW );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cylinderc), gl.STATIC_DRAW );

    gl.drawArrays( gl.TRIANGLES, 0, cylinderp.length );
}

//----------------------------------------------------------------------------


function upperArm() {

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerArm()
{
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var lightPosition = vec4(sun[0],sun[1],sun[2],1);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

    var camMatrix = mat4();

    if(checked){
      camMatrix = rotateX(90);
    }

    modelViewMatrix = rotate(theta[Base], 0, 1, 0 );
    modelViewMatrix = mult(camMatrix, modelViewMatrix);
    var scaleMatrix = scale4(2,2,2);
    modelViewMatrix = mult(scaleMatrix, modelViewMatrix);
    base();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1 ));
    lowerArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    upperArm();

    requestAnimFrame(render);
}
