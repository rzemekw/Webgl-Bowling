import Camera from "./camera.js";
import { cameraFov } from "./consts/cameraConsts.js";
import WebglProgramFactory from "./webglProgramFactory.js";
import WebglScene from "./webglScene.js";

export default class MirrorModel {
    constructor(corner1, corner2, corner3, corner4, normalInverted, globalScene, vsShaderText, fsShaderText) {
        this.globalScene = globalScene;
        this.corner1 = corner1;
        this.corner2 = corner2;
        this.corner3 = corner3;
        this.corner4 = corner4;
        this.mid = [
            (corner1[0] + corner2[0] + corner3[0] + corner4[0]) / 4,
            (corner1[1] + corner2[1] + corner3[1] + corner4[1]) / 4,
            (corner1[2] + corner2[2] + corner3[2] + corner4[2]) / 4,
        ]

        this.worldMatrix = glMatrix.mat4.create();

        const vertices = [].concat.apply([], [corner1, corner2, corner3, corner4]);
        const indices = [0, 1, 2, 0, 2, 3];
        const a = [corner1[0] - corner2[0], corner1[1] - corner2[1], corner1[2] - corner2[2]];
        const b = [corner3[0] - corner2[0], corner3[1] - corner2[1], corner3[2] - corner2[2]];
        let normal = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        console.log(a, b);
        glMatrix.vec3.normalize(normal, normal);
        if (normalInverted) {
            normal = normal.map(x => -x);
        }
        const normals = [].concat.apply([], [normal, normal, normal, normal]);

        this.normal = normal;
        this.planeD = -(normal[0] * corner1[0] + normal[1] * corner1[1] + normal[2] * corner1[2]);

        this.initScene(vsShaderText, fsShaderText);
        this.initBuffers(vertices, indices, normals);

        console.log(this.scene);
        console.log(this.globalScene);
    }

    initScene(vsShaderText, fsShaderText) {
        this.gl = this.globalScene.gl;
        this.canvas = this.gl.canvas;
        this.program = WebglProgramFactory.createProgram(this.gl, vsShaderText, fsShaderText);
        this.scene = new WebglScene(this.gl, this.program, [...this.globalScene.models]);
        this.scene.load();
    }

    initBuffers(vertices, indices, normals) {
        this.vbo = this.gl.createBuffer();
        this.ibo = this.gl.createBuffer();
        this.nbo = this.gl.createBuffer();
        this.tbo = this.gl.createBuffer();
        this.n = indices.length;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.texture = this.gl.createTexture();
    }

    updateTexture() {
        const camera = this.globalScene.camera;
        const nPos = this.getNewPos(camera.position[0], camera.position[1], camera.position[2]);
        // const nLookAt = this.getNewPos(camera.lookAt[0], camera.lookAt[1], camera.lookAt[2]);
        this.scene.camera = new Camera(nPos, this.mid, camera.up);
        this.updateTbo(this.scene.camera.getViewMatrix());
        this.scene.render();

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.canvas
        );
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    getTexture() {
        return this.texture;
    }

    updated() {
        return;
    }

    updateTbo(viewMatrix) {
        const gm = glMatrix.mat4.create();
        glMatrix.mat4.multiply(gm, this.scene.projMatrix, viewMatrix);
        const c1 = glMatrix.vec4.fromValues(this.corner1[0], this.corner1[1], this.corner1[2], 1);
        const c2 = glMatrix.vec4.fromValues(this.corner2[0], this.corner2[1], this.corner2[2], 1);
        const c3 = glMatrix.vec4.fromValues(this.corner3[0], this.corner3[1], this.corner3[2], 1);
        const c4 = glMatrix.vec4.fromValues(this.corner4[0], this.corner4[1], this.corner4[2], 1);

        glMatrix.vec4.transformMat4(c1, c1, gm);
        glMatrix.vec4.transformMat4(c2, c2, gm);
        glMatrix.vec4.transformMat4(c3, c3, gm);
        glMatrix.vec4.transformMat4(c4, c4, gm);

        glMatrix.vec4.scale(c1, c1, 1 / c1[3]);
        glMatrix.vec4.scale(c2, c2, 1 / c2[3]);
        glMatrix.vec4.scale(c3, c3, 1 / c3[3]);
        glMatrix.vec4.scale(c4, c4, 1 / c4[3]);

        // const texCoords = [c1[0] /2 + 0.5, c1[1] /2 + 0.5, c2[0] /2 + 0.5, c2[1] /2 + 0.5, c3[0] /2 + 0.5, c3[1] /2 + 0.5, c4[0] /2 + 0.5, c4[1] /2 + 0.5];
        const texCoords = [c1[0] /2 + 0.5, c1[1] /2 + 0.5, c2[0] /2 + 0.5, c2[1] /2 + 0.5, c3[0] /2 + 0.5, c3[1] /2 + 0.5, c4[0] /2 + 0.5, c4[1] /2 + 0.5];

        // const texCoords = [
        //     0.35,
        //     0.35,
        //     0.35,
        //     0.7,
        //     0.5,
        //     0.4,
        //     0.5,
        //     0.5,
        // ]

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
    }

    getNewPos(x, y, z) {
        const a = this.normal[0];
        const b = this.normal[1];
        const c = this.normal[2];
        const d = this.planeD;

        const t = (-a * x - b * y - c * z - d) / (a * a + b * b + c * c);

        const px = a * t + x;
        const py = b * t + y;
        const pz = c * t + z;

        return [2 * px - x, 2 * py - y, 2 * pz - z];
    }
}