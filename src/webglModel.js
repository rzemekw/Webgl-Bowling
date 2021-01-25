export default class WebglModel {
    constructor(vertices, indices, normals, texCoords, texture, gl, rotationAngles, translationVector) {
        this.vbo = gl.createBuffer();
        this.ibo = gl.createBuffer();
        this.nbo = gl.createBuffer();
        this.tbo = gl.createBuffer();
        this.n = indices.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE,
            texture
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.worldMatrix = glMatrix.mat4.create();
        if (rotationAngles) {
            this.xRotationAngle = rotationAngles[0];
            this.yRotationAngle = rotationAngles[1];
            this.zRotationAngle = rotationAngles[2];
        }
        this.translationVector = translationVector;
        this.applyTransform();
    }

    onUpdate = [];

    updated(interval) {
        this.onUpdate.forEach(e => e([...this.translationVector], interval));
    }

    addOnUpdateEvent(e) {
        this.onUpdate.push(e);
    }

    removeOnUpdateEvent(e) {
        this.onUpdate = this.onUpdate.filter(x => x !== e);
    }

    getTexture() {
        return this.texture;
    }

    applyTransform() {
        glMatrix.mat4.identity(this.worldMatrix);
        if (this.translationVector) {
            glMatrix.mat4.translate(this.worldMatrix, this.worldMatrix, this.translationVector);
        }

        // if(this.xRotationAngle !== undefined) {
        //     const q = glMatrix.quat.create();
        //     const rotM = glMatrix.mat4.create();
        //     glMatrix.quat.fromEuler(q, this.xRotationAngle, this.yRotationAngle, this.zRotationAngle);
        //     glMatrix.mat4.fromQuat(rotM, q);
        //     glMatrix.mat4.multiply(this.worldMatrix, this.worldMatrix, rotM);
        // }

        if (this.xRotationAngle) {
            glMatrix.mat4.rotateX(this.worldMatrix, this.worldMatrix, this.xRotationAngle);
        }
        if (this.yRotationAngle) {
            glMatrix.mat4.rotateY(this.worldMatrix, this.worldMatrix, this.yRotationAngle);
        }
        if (this.zRotationAngle) {
            glMatrix.mat4.rotateZ(this.worldMatrix, this.worldMatrix, this.zRotationAngle);
        }
    }
}