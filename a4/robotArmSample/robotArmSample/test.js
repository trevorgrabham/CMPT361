"use strict";

var canvas, gl, program;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;
var vBuffer, cBuffer;

let points = [];
let vertices = [];
let colors = [];


function initColors(n, r, g, b){
  for(var i=0;i<n;i++){
    colors.push(vec4(r,g,b,1));
  }
}

function quad(a, b, c, d){
  points.push(vertices[a]);
  points.push(vertices[b]);
  points.push(vertices[c]);
  points.push(vertices[a]);
  points.push(vertices[c]);
  points.push(vertices[d]);
}


function initSphereVertices(nLong, nLat){
  let longInc = 2*Math.PI/nLong;
  let latInc = Math.PI/nLat;
  let longAngle = 0;
  let latAngle = 0;

  for(var i=0;i<=nLat;i++){
    latAngle = Math.PI/2 - i*latInc;
    let xy = Math.cos(latAngle);
    let z = Math.sin(latAngle);
    for(var j=0;j<=nLong;j++){
      longAngle = j*longInc;
      let x = xy * Math.cos(longAngle);
      let y = xy * Math.sin(longAngle);
      vertices.push(vec4(x,y,z,1));
      // push norms here vec4(normalize((x,y,z)),1)
    }
  }
}


function initSphere(nLong, nLat){
  var k1,k2;

  for(var i=0;i<nLat;i++){
    k1 = i * (nLong+1);
    k2 = k1 + nLong + 1;

    for(var j=0;j<nLong;j++,k1++,k2++){
      if(i != 0){
        points.push(vertices[k1]);
        points.push(vertices[k2]);
        points.push(vertices[k1+1]);
      }
      if(i != nLat-1){
        points.push(vertices[k1+1]);
        points.push(vertices[k2]);
        points.push(vertices[k2+1]);
      }
    }
  }
}


function initCylinderVertices(n){
  let angle = 0;
  let inc = Math.PI*2/n;
  for(var i=0;i<n;i++){
    vertices.push(vec4(Math.cos(angle), 1, Math.sin(angle), 1));
    angle += inc;
  }
  angle = 0;
  for(var i=0;i<n;i++){
    vertices.push(vec4(Math.cos(angle), 0, Math.sin(angle), 1));
    angle += inc;
  }
}

function initCylinder(n) {
  for(var i=0;i<n-1;i++){
    quad(i,i+1,i+n+1,i+n);
  }
  quad(n-1,0,n,2*n-1);
  for(var i=0;i<n-1;i++){
    points.push(vec4(0,1,0,1));
    points.push(vertices[i]);
    points.push(vertices[i+1]);
  }
  points.push(vec4(0,1,0,1));
  points.push(vertices[n-1]);
  points.push(vertices[0]);
  for(var i=0;i<n-1;i++){
    points.push(vec4(0,0,0,1));
    points.push(vertices[n+i]);
    points.push(vertices[n+i+1]);
  }
  points.push(vec4(0,0,0,1));
  points.push(vertices[2*n-1]);
  points.push(vertices[n]);
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
    // initCylinderVertices(36);
    // initCylinder(36);
    // initColors(36*6, 1, 0, 0);
    // initColors(36*3, 0, 1, 0);
    // initColors(36*3, 0, 0, 1);


    // initCircleVertices(36, top_circle_vertices,1);
    // initCircle(top_circle_points, top_circle_vertices);
    // initCircleVertices(36, bottom_circle_vertices,0);
    // initCircle(bottom_circle_points, bottom_circle_vertices);

    // for(var i=0;i<top_circle_points.length;i++){
    //   cylinder_points.push(top_circle_points[i]);
    //   cylinder_colors.push(vec4(0,1,0,1));
    // }
    // for(var i=0;i<bottom_circle_points.length;i++){
    //   cylinder_points.push(bottom_circle_points[i]);
    //   cylinder_colors.push(vec4(0,0,1,1));
    // }

    initSphereVertices(36,18);
    initSphere(36,18);
    initColors(points.length, 0,0,1);



    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );




    render();
}

var delta = 0;

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    let projectionMatrix = mat4();
    projectionMatrix = rotateX(delta++);
    projectionMatrix = mult(scale4(0.5,0.5,0.5),projectionMatrix);


    let projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');


    gl.uniformMatrix4fv( projectionMatrixLoc,  false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, points.length)


    requestAnimFrame(render);
}
