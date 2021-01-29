import Camera from "./camera.js";
import WebglScene from "./webglScene.js";

export default class MirrorModel {
    constructor(corner1, corner2, corner3, corner4, normalInverted, globalScene) {
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
        this.n = 2;

        this.worldMatrix = glMatrix.mat4.create();

        const vertices = [].concat.apply([], [corner1, corner2, corner3, corner4]);
        console.log(vertices)
        const indices = [0, 1, 2, 0, 2, 3];
        const a = [corner1[0] - corner2[0], corner1[1] - corner2[1], corner1[2] - corner2[2]];
        const b = [corner3[0] - corner2[0], corner3[1] - corner2[1], corner3[2] - corner2[2]];
        let normal = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        glMatrix.vec3.normalize(normal, normal);
        if (normalInverted) {
            normal = normal.map(x => -x);
        }
        const normals = [].concat.apply([], [normal, normal, normal, normal]);

        this.normal = normal;
        this.planeD = -(normal[0] * corner1[0] + normal[1] * corner1[1] + normal[2] * corner1[2]);

        this.initScene();
        this.initBuffers(vertices, indices, normals);

        console.log(this.scene);
        console.log(this.globalScene);
    }

    initScene() {
        this.gl = this.globalScene.gl;
        this.canvas = this.gl.canvas;
        this.scene = new WebglScene(this.gl, this.globalScene.phongProgram, [...this.globalScene.models],
            this.globalScene.mirrorProgram, this.globalScene.staticProgram);
        this.scene.load();
    }

    initBuffers(vertices, indices, normals) {
        this.vbo = this.gl.createBuffer();
        this.ibo = this.gl.createBuffer();
        this.n = indices.length;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.texture = this.gl.createTexture();
    }

    updateTexture() {
        const camera = this.globalScene.camera;
        const nPos = this.getNewPos(camera.position[0], camera.position[1], camera.position[2]);
        this.scene.camera = new Camera(nPos, this.mid, camera.up);

        this.projMatrix = this.scene.projMatrix;
        this.viewMatrix = this.scene.camera.getViewMatrix();

        this.scene.mode = this.globalScene.mode;
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