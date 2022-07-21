let vertexShaderText = [
	"precision mediump float;",
	"",
	"attribute vec2 vertPosition;",
	"attribute vec3 vertColor;",
	"varying vec3 fragColor;",
	"",
	"void main()",
	"{",
	"	fragColor = vertColor;",
	"	gl_Position = vec4(vertPosition, 0.0, 1.0);",
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

function getGLContext() {
	const canvas = document.getElementById("game-surface");

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
	const gl = getGLContext();

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
	const triangleVertices = 
	[// X, Y       R  G  B
		0.0, 0.5,   1.0, 0.5, 0.3,
		-0.5, -0.5, 0.2, 0.8, 0.0,
		0.5, -0.5,  0.0, 0.1, 0.9  
	]

	// prepare the buffer for vertices
	const triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	// get position of the input attribute in GLSL
	const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
	const colorAttribLocation = gl.getAttribLocation(program, "vertColor");

	gl.vertexAttribPointer(
		positionAttribLocation, // attrib location
		2, // number element per attribute (2 for X, Y)
		gl.FLOAT, // type of element (32 bit float here)
		gl.FALSE, // is the data normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // size (bytes) of a single vertex (5 elements X, Y, R, G, B for each vertex here)
		0 // offset from the beginning of a single vertex to this attribute: first 2 attrib so no offset
	)

	gl.vertexAttribPointer(
		colorAttribLocation, // attrib location
		3, // number element per attribute (3 for R, G, B)
		gl.FLOAT, // type of element (32 bit float here)
		gl.FALSE, // is the data normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // size (bytes) of a single vertex (5 elements X, Y, R, G, B for each vertex here)
		2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute: skip 2 first attrib (X, Y) to have (R, G, B)
	)

	// enable the attribute for use
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// MAIN RENDER LOOP
	gl.useProgram(program);
	gl.drawArrays(
		gl.TRIANGLES, // draw mode, 99% will be TRIANGLE
		0, // number of vertices to skip
		3 // total number of vertices
	)
}
