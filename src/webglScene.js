import Camera from './camera.js'
import { cameraFov, cameraInitialLookAt, cameraInitialPosition, cameraInitialUp } from './consts/cameraConsts.js';
import { ambientLight, sunLightDirection, sunLightIntesity } from './consts/lightConsts.js';

export default class WebglScene {
    constructor(gl, program, models, mirrorProgram) {
        this.gl = gl;
        this.program = program;
        this.models = models;
        this.mirrorProgram = mirrorProgram;
    }

    projMatrix = glMatrix.mat4.create();
    updateEvents = [];
    mirrors = [];

    camera = new Camera(
        cameraInitialPosition,
        cameraInitialLookAt,
        cameraInitialUp
    );

    load() {
        this.program.uniforms = {
            mProj: this.gl.getUniformLocation(this.program, 'mProj'),
            mView: this.gl.getUniformLocation(this.program, 'mView'),
            mWorld: this.gl.getUniformLocation(this.program, 'mWorld'),

            ambientUniformLocation: this.gl.getUniformLocation(this.program, 'ambientLightIntensity'),
            sunlightDirUniformLocation: this.gl.getUniformLocation(this.program, 'sun.direction'),
            sunlightIntUniformLocation: this.gl.getUniformLocation(this.program, 'sun.color'),
            materialKd: this.gl.getUniformLocation(this.program, 'material.kd'),
            materialShininess: this.gl.getUniformLocation(this.program, 'material.shininess'),
            cameraPositionLocation: this.gl.getUniformLocation(this.program, 'cameraPosition'),
        };

        this.program.attribs = {
            vPos: this.gl.getAttribLocation(this.program, 'vertPosition'),
            vNorm: this.gl.getAttribLocation(this.program, 'vertNormal'),
            vTex: this.gl.getAttribLocation(this.program, 'vertTexCoord'),
        };

        glMatrix.mat4.perspective(
            this.projMatrix,
            glMatrix.glMatrix.toRadian(cameraFov),
            this.gl.canvas.width / this.gl.canvas.height,
            0.1,
            1000
        );

        if (!this.mirrorProgram) {
            return;
        }

        this.mirrorProgram.uniforms = {
            mProj: this.gl.getUniformLocation(this.mirrorProgram, 'mProj'),
            mView: this.gl.getUniformLocation(this.mirrorProgram, 'mView'),
            mWorld: this.gl.getUniformLocation(this.mirrorProgram, 'mWorld'),
            mirrorMView: this.gl.getUniformLocation(this.mirrorProgram, 'mirrorMView'),
            mirrorMProj: this.gl.getUniformLocation(this.mirrorProgram, 'mirrorMProj'),
        }

        this.mirrorProgram.attribs = {
            vPos: this.gl.getAttribLocation(this.program, 'vertPosition'),
        };
    }

    render() {

        this.mirrors.forEach(m => {
            m.updateTexture();
        });

        this.gl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);

        this.renderMirrors();

        this.gl.useProgram(this.program);
        this.gl.uniformMatrix4fv(this.program.uniforms.mProj, this.gl.FALSE, this.projMatrix);
        this.gl.uniformMatrix4fv(this.program.uniforms.mView, this.gl.FALSE, this.camera.getViewMatrix());

        this.gl.uniform3f(this.program.uniforms.ambientUniformLocation, ...ambientLight);
        this.gl.uniform3f(this.program.uniforms.sunlightDirUniformLocation, ...sunLightDirection);
        this.gl.uniform3f(this.program.uniforms.sunlightIntUniformLocation, ...sunLightIntesity);
        this.gl.uniform3f(this.program.uniforms.cameraPositionLocation, ...this.camera.position);

        this.models.forEach(m => {
            this.gl.uniformMatrix4fv(this.program.uniforms.mWorld, this.gl.FALSE, m.worldMatrix);

            this.gl.uniform1f(this.program.uniforms.materialKd, m.material.kd);
            this.gl.uniform1f(this.program.uniforms.materialShininess, m.material.shininess);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.vbo);
            this.gl.vertexAttribPointer(
                this.program.attribs.vPos,
                3, this.gl.FLOAT, this.gl.FALSE,
                0, 0
            );
            this.gl.enableVertexAttribArray(this.program.attribs.vPos);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.nbo);
            this.gl.vertexAttribPointer(
                this.program.attribs.vNorm,
                3, this.gl.FLOAT, this.gl.FALSE,
                0, 0
            );
            this.gl.enableVertexAttribArray(this.program.attribs.vNorm);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.tbo);
            this.gl.vertexAttribPointer(
                this.program.attribs.vTex,
                2, this.gl.FLOAT, this.gl.FALSE,
                0, 0
            );
            this.gl.enableVertexAttribArray(this.program.attribs.vTex);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, m.ibo);

            this.gl.bindTexture(this.gl.TEXTURE_2D, m.getTexture());
            this.gl.activeTexture(this.gl.TEXTURE0);

            this.gl.drawElements(this.gl.TRIANGLES, m.n, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        });
    };

    renderMirrors() {
        if (!this.mirrorProgram) {
            return;
        }
        this.gl.useProgram(this.mirrorProgram);
        this.gl.uniformMatrix4fv(this.mirrorProgram.uniforms.mProj, this.gl.FALSE, this.projMatrix);
        this.gl.uniformMatrix4fv(this.mirrorProgram.uniforms.mView, this.gl.FALSE, this.camera.getViewMatrix());

        this.mirrors.forEach(m => {
            this.gl.uniformMatrix4fv(this.mirrorProgram.uniforms.mWorld, this.gl.FALSE, m.worldMatrix);
            this.gl.uniformMatrix4fv(this.mirrorProgram.uniforms.mirrorMProj, this.gl.FALSE, m.projMatrix);
            this.gl.uniformMatrix4fv(this.mirrorProgram.uniforms.mirrorMView, this.gl.FALSE, m.viewMatrix);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.vbo);
            this.gl.vertexAttribPointer(
                this.mirrorProgram.attribs.vPos,
                3, this.gl.FLOAT, this.gl.FALSE,
                0, 0
            );
            this.gl.enableVertexAttribArray(this.mirrorProgram.attribs.vPos);


            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, m.ibo);

            this.gl.bindTexture(this.gl.TEXTURE_2D, m.getTexture());
            this.gl.activeTexture(this.gl.TEXTURE0);

            this.gl.drawElements(this.gl.TRIANGLES, m.n, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        });
    }

    start() {
        let prevFrame = performance.now();
        let nextFrame;
        let interval;
        const loop = () => {
            nextFrame = performance.now();
            interval = nextFrame - prevFrame;
            prevFrame = nextFrame;

            this._update(interval);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    unprojectPoint(x, y) {

        const invProjM = glMatrix.mat4.create();
        glMatrix.mat4.invert(invProjM, this.projMatrix);

        const invViewM = glMatrix.mat4.create();
        glMatrix.mat4.invert(invViewM, this.camera.getViewMatrix());

        const invMat = glMatrix.mat4.create();

        glMatrix.mat4.multiply(invMat, this.projMatrix, this.camera.getViewMatrix());
        glMatrix.mat4.invert(invMat, invMat);

        const vec1 = glMatrix.vec3.fromValues(x, y, -1);
        const vec2 = glMatrix.vec3.fromValues(x, y, 1);
        glMatrix.vec3.transformMat4(vec1, vec1, invMat);
        glMatrix.vec3.transformMat4(vec2, vec2, invMat);

        return { start: vec1, end: vec2 };
    }

    _update(interval) {
        this.updateEvents.forEach(e => e(interval));
        this.models.forEach(m => m.updated(interval));
    }

    addUpdateEvent = e => {
        this.updateEvents.push(e);
    }

    removeUpdateEvent = e => {
        this.updateEvents = this.updateEvents.filter(x => x !== e);
    }

    addMirror(mirrorModel) {
        this.mirrors.push(mirrorModel);
    }
}