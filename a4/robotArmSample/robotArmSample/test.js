"use strict";

var canvas, gl, program;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

let points = [];
let vertices = [];
let colors = [];

function initCircleVertices (n){
  let angle = 0;
  let inc = Math.PI*2/n;
  for(var i=0;i<n;i++){
    vertices.push(vec4(Math.cos(angle), Math.sin(angle), 0, 1));
    angle += inc;
  }
}

function initCircle(){
  for(var i=0;i<vertices.length-1;i++){
    points.push(vec4(0,0,0,1));
    points.push(vertices[i]);
    points.push(vertices[i+1]);
  }
  points.push(vec4(0,0,0,1));
  points.push(vertices[vertices.length-1]);
  points.push(vertices[0]);
  for(var i=0;i<points.length;i++){
    colors.push(vec4(1,0,0,1));
  }
}

function quad(a, b, c, d){
  points.push(vertices[a]);
  points.push(vertices[b]);
  points.push(vertices[c]);
  points.push(vertices[a]);
  points.push(vertices[c]);
  points.push(vertices[d]);
  for(var i=0;i<6;i++){
    colors.push(vec4(1,0,0,1));
  }
}

function initCylinderVertices(n){
  let angle = 0;
  let inc = Math.PI*2/n;
  for(var i=0;i<n;i++){
    vertices.push(vec4(Math.cos(angle), 1, Math.sin(angle)-0.5, 1));
    angle += inc;
  }
  angle = 0;
  for(var i=0;i<n;i++){
    vertices.push(vec4(Math.cos(angle), 0, Math.sin(angle)-0.5, 1));
    angle += inc;
  }
}

function initCylinder() {
  let n = vertices.length/2;
  for(var i=0;i<n-1;i++){
    quad(i,i+1,i+n+1,i+n);
  }
  quad(n-1,0,n,2*n-1);
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


    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // initCircleVertices(36);
    // initCircle();
    initCylinderVertices(36);
    initCylinder();

    // Create and initialize  buffer objects

    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );




    render();
}


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    let projectionMatrix = mat4();
    projectionMatrix = rotateX(45);
    let projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');

    gl.uniformMatrix4fv( projectionMatrixLoc,  false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, points.length)

    requestAnimFrame(render);
}
