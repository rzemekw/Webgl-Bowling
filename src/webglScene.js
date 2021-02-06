import Camera from './camera.js'
import { cameraFov, cameraInitialLookAt, cameraInitialPosition, cameraInitialUp } from './consts/cameraConsts.js';
import { ambientLight} from './consts/lightConsts.js';
import { sceneColor } from './consts/sceneConsts.js';
import ShaderProgramRepository from './repository/shaderProgramRepository.js';

export default class WebglScene {

    static createFromScene(scene) {
        const result = new WebglScene(scene.gl)
        result.phongProgram = scene.phongProgram;
        result.staticProgram = scene.staticProgram;
        result.mirrorProgram = scene.mirrorProgram;
        result.currentProgram = scene.currentProgram;
        result.models = scene.models;
        result.mirrors = [...scene.mirrors];
        result.reflectors = scene.reflectors;
        result.sun = scene.sun;

        return result;
    }

    constructor(gl) {
        this.gl = gl;

        glMatrix.mat4.perspective(
            this.projMatrix,
            glMatrix.glMatrix.toRadian(cameraFov),
            this.gl.canvas.width / this.gl.canvas.height,
            0.1,
            1000
        );
    }

    camera = new Camera(
        cameraInitialPosition,
        cameraInitialLookAt,
        cameraInitialUp
    );
    projMatrix = glMatrix.mat4.create();

    updateEvents = [];

    models = [];
    mirrors = [];
    reflectors = [];

    mode = 'PHONG'
    sun = null;
    fog = null;

    async loadPrograms() {
        const [phong, staticp, mirror] = await Promise.all([
            ShaderProgramRepository.getPhongProgram(this.gl),
            ShaderProgramRepository.getStaticProgram(this.gl),
            ShaderProgramRepository.getMirrorProgram(this.gl)
        ]);
        this.phongProgram = phong;
        this.staticProgram = staticp;
        this.mirrorProgram = mirror;
        this.currentProgram = phong;
    }

    loadModels(models) {
        this.models = models;
    }

    _useProgram() {
        switch (this.mode) {
            case 'PHONG':
                this.currentProgram = this.phongProgram;
                break;
            case 'STATIC':
                this.currentProgram = this.staticProgram;
                break;
            default:
                throw new Error('wrong mode')
        }

        this.gl.useProgram(this.currentProgram);
    }

    _bindModelStatic(m) {
        this.gl.uniformMatrix4fv(this.currentProgram.uniforms.mWorld, this.gl.FALSE, m.worldMatrix);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.vbo);
        this.gl.vertexAttribPointer(
            this.currentProgram.attribs.vPos,
            3, this.gl.FLOAT, this.gl.FALSE,
            0, 0
        );
        this.gl.enableVertexAttribArray(this.currentProgram.attribs.vPos);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.tbo);
        this.gl.vertexAttribPointer(
            this.currentProgram.attribs.vTex,
            2, this.gl.FLOAT, this.gl.FALSE,
            0, 0
        );
        this.gl.enableVertexAttribArray(this.currentProgram.attribs.vTex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, m.ibo);

        this.gl.bindTexture(this.gl.TEXTURE_2D, m.getTexture());
        this.gl.activeTexture(this.gl.TEXTURE0);
    }

    _bindModelPhong(m) {
        this._bindModelStatic(m);

        this.gl.uniform1f(this.currentProgram.uniforms.materialKd, m.material.kd);
        this.gl.uniform1f(this.currentProgram.uniforms.materialShininess, m.material.shininess);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, m.nbo);
        this.gl.vertexAttribPointer(
            this.currentProgram.attribs.vNorm,
            3, this.gl.FLOAT, this.gl.FALSE,
            0, 0
        );
        this.gl.enableVertexAttribArray(this.currentProgram.attribs.vNorm);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    _bindMatrices() {
        this.gl.uniformMatrix4fv(this.currentProgram.uniforms.mProj, this.gl.FALSE, this.projMatrix);
        this.gl.uniformMatrix4fv(this.currentProgram.uniforms.mView, this.gl.FALSE, this.camera.getViewMatrix());
    }

    _bindLight() {
        this.gl.uniform3f(this.currentProgram.uniforms.ambientUniformLocation, ...ambientLight);
        if (this.sun) {
            this.gl.uniform3f(this.currentProgram.uniforms.sunlightDirUniformLocation, ...this.sun.direction);
            this.gl.uniform3f(this.currentProgram.uniforms.sunlightIntUniformLocation, ...this.sun.intensity);
        }
        else {
            this.gl.uniform3f(this.currentProgram.uniforms.sunlightDirUniformLocation, 1, 1, 1);
            this.gl.uniform3f(this.currentProgram.uniforms.sunlightIntUniformLocation, 0, 0, 0);
        }
        this.gl.uniform1i(this.currentProgram.uniforms.reflectorsNumLocation, this.reflectors.length);

        this.reflectors.forEach((r, i) => {
            this.gl.uniformMatrix4fv(this.currentProgram.uniforms.reflectorsLocations[i].worldLocation, this.gl.FALSE, r.getWorld());
            this.gl.uniform1f(this.currentProgram.uniforms.reflectorsLocations[i].focusLocation, r.focus);
            this.gl.uniform3f(this.currentProgram.uniforms.reflectorsLocations[i].intensityLocation, ...r.intensity);
        })

    }

    _bindModel(m) {
        switch (this.mode) {
            case 'PHONG':
                this._bindModelPhong(m);
                return;
            case 'STATIC':
                this._bindModelStatic(m);
                return;
            default:
                throw new Error('wrong mode')
        }
    }

    _bindFog() {
        this.gl.uniform3f(this.currentProgram.uniforms.fogColorLocation, ...this.fog.color);
        this.gl.uniform1f(this.currentProgram.uniforms.fogDensityLocation, this.fog.density);
    }

    _bindInitial() {
        this.gl.uniform3f(this.currentProgram.uniforms.cameraPositionLocation, ...this.camera.position);
        this._bindMatrices();
        if(this.fog) {
            this._bindFog();
        }
        if (this.mode == 'PHONG') {
            this._bindLight();
        }
    }

    render() {
        this.mirrors.forEach(m => {
            m.updateTexture();
        });

        if(this.sun === null) {
            if(this.fog === null) {
                this.gl.clearColor(...sceneColor, 1.0);
            }
            else {
                this.gl.clearColor(...this.fog.color, 1.0);
            }
        }
        else {
            if(this.fog === null) {
                this.gl.clearColor(...sceneColor.map((c,i) => c * this.sun.intensity[i]), 1.0);
            }
            else {
                this.gl.clearColor(...this.fog.color.map((c,i) => c * this.sun.intensity[i]), 1.0);
            }
        }


        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);

        this.renderMirrors();

        this._useProgram();

        this._bindInitial();

        this.models.forEach(m => {
            this._bindModel(m);

            this.gl.drawElements(this.gl.TRIANGLES, m.n, this.gl.UNSIGNED_SHORT, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        });
    }

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

    addReflector(reflector) {
        this.reflectors.push(reflector);
    }
}