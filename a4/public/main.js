const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

if(!gl){
  throw new Error('WebGL not supported');
}


function createPointCloud(count) {
  var points = [];
  const r = () => Math.random() - 0.5;
  for(var i=0;i<count;i++){
    const inputPoint = [r(), r(), r()];
    const outputPoint = vec3.normalize(vec3.create(), inputPoint);
    points.push(...outputPoint);
  }
  return points;
}

const vertexData = createPointCloud(1e4);

// create the buffer and give it the data
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);



// create the vertex shader, give it a program to run, and compile it
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
  precision mediump float;

  attribute vec3 position;
  varying vec3 vColor;

  uniform mat4 matrix;

  void main() {
    vColor = vec3(position.xy + 0.5, 1);
    gl_Position = matrix * vec4(position, 1);
    gl_PointSize=1.0;
  }
  `);
  gl.compileShader(vertexShader);

// create the fragment shader, give it a program to run, and compile it
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, `
    precision mediump float;

    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1);
    }
    `);
gl.compileShader(fragShader);

// create a program and link the shaders to it, as well as link the program to gl
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program,fragShader);
gl.linkProgram(program);

// give the gpu some information about the data that is coming in
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);                   // we have to rebind the buffer here, because gl will default to binding the pointer to the most recently bound buffer (color), which is wrong
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

//const colorLocation = gl.getAttribLocation(program, `color`);
//gl.enableVertexAttribArray(colorLocation);
//gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);                   // we have to rebind the buffer here, because gl will default to binding the pointer to the most recently bound buffer (position), which is wrong
//gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// use the program and tell it what kind of shapes to interpret the vertecies as
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, 'matrix'),
};

// cretae a matrix to hold all of the translations and rotations and scaling of our model
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
mat4.translate(viewMatrix, viewMatrix, [0,0,3]);

mat4.invert(viewMatrix, viewMatrix);

// create a matrix that will handle the perspective projections on the models
var projMatrix = mat4.create();
mat4.perspective(projMatrix,
  75*Math.PI/180,         // vertical FOV
  canvas.width/canvas.height,     // aspect ratio (W/H)
  1e-4,        // near cull distance (how close can an object get before it disappears)
  1e4        // far cull distance (can be used to booost performace so that we have a specific render distance)
);


// a matrix to hold our intermediate values of the model matrix times the view matrix
var mvMatrix = mat4.create();


var mvpMatrix = mat4.create();


function animate() {
  requestAnimationFrame(animate);
  //mat4.rotateZ(modelMatrix, modelMatrix, Math.PI/(2*100));
  //mat4.rotateX(modelMatrix, modelMatrix, Math.PI/(2*100));
  mat4.rotateY(modelMatrix, modelMatrix, Math.PI/(2*360));

  // need to do the translation and rotation before projection, so we put it in backwards to multiply cause we go R to L in matrix multiplication
  mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
  mat4.multiply(mvpMatrix, projMatrix, mvMatrix);

  gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
  gl.drawArrays(gl.POINTS, 0, vertexData.length/3);
}

animate();
