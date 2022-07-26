const vertexShaderText = 
`precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor;

void main()
{
  fragColor = vertColor;
  gl_Position = vec4(vertPosition, 0.0, 1.0);
}`;

const fragmentShaderText = 
`precision mediump float;

varying vec3 fragColor;

void main()
{
  gl_FragColor = vec4(fragColor, 1.0);
}` 

function checkShaderCompileStatus(gl, shader) {
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw Error("ERROR: compile shader failed: " + gl.getShaderInfoLog(shader));
  }
}

function checkProgramLinkStatus(gl, program) {
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw Error('ERROR: link program failed: ' + gl.getProgramInfoLog(program));
	}
}

function validateProgram(gl, program) {
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		throw Error('ERROR: validate program failed: ' + gl.getProgramInfoLog(program));
	}
}

function clearGL(gl) {
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function createShader(gl, shaderType, shaderText) {
	const shader = gl.createShader(shaderType);

	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);

	checkShaderCompileStatus(gl, shader);
	return shader;
}

function initDemo() {
	console.log('Init GL')

  const canvas = document.getElementById('game-surface');
  const gl = canvas.getContext('webgl');

	clearGL(gl);
  
	// create shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	// set shader source
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

	// compile shader
  gl.compileShader(vertexShader);
  checkShaderCompileStatus(gl, vertexShader);

  gl.compileShader(fragmentShader);
  checkShaderCompileStatus(gl, fragmentShader);

	// create program and link shader to program
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	checkProgramLinkStatus(gl, program);
	validateProgram(gl, program);

	const triangleVertexes = [
		// X, Y, 		R, G, B
		0.0, 0.5,   1.0, 0.0, 0.0,
		-0.5, -0.5, 0.0, 1.0, 0.0,
		0.5, -0.5,  0.0, 0.0, 1.0 
	]

	const triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexes), gl.STATIC_DRAW);

	const vertPositionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	const vertColorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	
	gl.vertexAttribPointer(
		vertPositionAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		0
	)

	gl.vertexAttribPointer(
		vertColorAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT
	)

	gl.enableVertexAttribArray(vertPositionAttribLocation);
	gl.enableVertexAttribArray(vertColorAttribLocation);

	gl.useProgram(program)

	gl.drawArrays(gl.TRIANGLES, 0, 3)
}