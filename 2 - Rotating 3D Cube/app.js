let vertexShaderText = [
	"precision mediump float;",
	"",
	"attribute vec3 vertPosition;",
	"attribute vec3 vertColor;",
	"varying vec3 fragColor;",
	"uniform mat4 mWorld;", // rotating the cube in 3D world
	"uniform mat4 mView;", // the camera
	"uniform mat4 mProj;", // projection on the screen
	"",
	"void main()",
	"{",
	"	fragColor = vertColor;",
	"	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
	"}",
].join("\n");

let fragmentShaderText = [
	"precision mediump float;",
	"",
	"varying vec3 fragColor;",
	"",
	"void main()",
	"{",
	"	gl_FragColor = vec4(fragColor, 1.0);",
	"}",
].join("\n");

function getCanvas() {
	return document.getElementById("game-surface");
}

function getGLContext(canvas) {
	let gl = canvas.getContext("webgl");

	if (!gl) {
		console.log("WebGL not supported, fallback to experimental");
		gl = canvas.getContext("experimental-webgl");
	}

	if (!gl) {
		alert("Your browser does not support WebGL");
	}

	return gl;
}

function clearGL(gl, red = 0.75, green = 0.85, blue = 0.8 , alpha = 1.0) {
	gl.clearColor(red, green, blue, alpha);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function checkShaderCompileStatus(gl, shader, hintText = "") {
	const isCompileSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!isCompileSuccess) {
		console.error(
			"ERROR compile shader " + hintText,
			gl.getShaderInfoLog(shader)
		);
	}
	return isCompileSuccess;
}

function checkProgramLinkStatus(gl, program, hintText = "") {
	const isLinkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!isLinkSuccess) {
		console.error(
			"ERROR linking program " + hintText,
			gl.getProgramInfoLog(program)
		);
	}
	return isLinkSuccess;
}

function validateProgram(gl, program, hintText = "") {
	gl.validateProgram(program);
	const validateStatus = gl.getProgramParameter(program, gl.VALIDATE_STATUS);
	if (!validateStatus) {
		console.error(
			"ERROR validate program " + hintText,
			gl.getProgramInfoLog(program)
		);
	}
	return validateStatus;
}

function initDemo() {
	const canvas = getCanvas();
	const gl = getGLContext(canvas);

	// enable GL features
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);

	clearGL(gl);

	// Shader code
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	// set shader source
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	// compile shaders
	gl.compileShader(vertexShader);
	checkShaderCompileStatus(gl, vertexShader);

	gl.compileShader(fragmentShader);
	checkShaderCompileStatus(gl, fragmentShader);

	// attach shader linking program
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	checkProgramLinkStatus(gl, program);

	// catch further error but more expensive, often only do it in testing
	validateProgram(gl, program);

	// vertices position, good habit is write it counter clockwise
	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	// prepare the buffer for vertices
	const boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	const boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	// get position of the input attribute in GLSL
	const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
	const colorAttribLocation = gl.getAttribLocation(program, "vertColor");

	gl.vertexAttribPointer(
		positionAttribLocation, // attrib location
		3, // number element per attribute (3 for X, Y, Z)
		gl.FLOAT, // type of element (32 bit float here)
		gl.FALSE, // is the data normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // size (bytes) of a single vertex (6 elements X, Y, Z, R, G, B for each vertex here)
		0 // offset from the beginning of a single vertex to this attribute: first 2 attrib so no offset
	)

	gl.vertexAttribPointer(
		colorAttribLocation, // attrib location
		3, // number element per attribute (3 for R, G, B)
		gl.FLOAT, // type of element (32 bit float here)
		gl.FALSE, // is the data normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // size (bytes) of a single vertex (6 elements X, Y, Z, R, G, B for each vertex here)
		3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute: skip 2 first attrib (X, Y) to have (R, G, B)
	)

	// enable the attribute for use
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// Tell WebGL that we will use this program
	gl.useProgram(program);

	// handle the uniforms
	let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	let matWorld = new Float32Array(16);
	let matView = new Float32Array(16);
	let matProj = new Float32Array(16);
	glMatrix.mat4.identity(matWorld);
	glMatrix.mat4.lookAt(
		matView, 
		[0, 0, -5], // eye position
		[0, 0, 0], // center (focal point)
		[0, 1, 0], // up axis
	);
	glMatrix.mat4.perspective(
		matProj,
		glMatrix.glMatrix.toRadian(45), // field of view (fovy) in radiant
		canvas.width / canvas.height, // aspect ratio (viewport ratio)
		0.1, // nearest point
		1000.0 // farthest point
	);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matWorld);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, matView);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, matProj);

	// MAIN RENDER LOOP
	
	let identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);

	// separate rotation matrix for X and Y axes
	let xRotationMatrix = new Float32Array(16);
	let yRotationMatrix = new Float32Array(16);

	const secsForOneCircle = 6; 
	let currentSecond = 0;
	let angle = 0;

	var loop = function() {
		currentSecond = performance.now() / 1000;
		angle = currentSecond / secsForOneCircle * (2 * Math.PI); // finish a circle each 6s
		
		glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0])
		glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle / 4, [1, 0, 0])
		glMatrix.mat4.mul(matWorld, xRotationMatrix, yRotationMatrix);

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matWorld);

		clearGL(gl);

		gl.drawElements(
			gl.TRIANGLES, // draw mode, 99% will be TRIANGLES
			boxIndices.length, // total number of vertices,
			gl.UNSIGNED_SHORT, // type of indices
			0, // number of vertices to skip
		)

		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
}


