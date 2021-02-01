export default class Camera {
    constructor(position, lookAt, up) {
        this.position = position;
        this.lookAt = lookAt;
        this.up = up;
    }
    
    getViewMatrix() {
        const out = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(out, this.position, this.lookAt, this.up);
        return out;
    }
};