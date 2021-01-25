export default class Camera {
    constructor(position, lookAt, up) {
        this.forward = glMatrix.vec3.create();
        this.up = glMatrix.vec3.create();
        this.right = glMatrix.vec3.create();
    
        this.position = position;
        this.lookAt = lookAt;
        this.up = up;
    
        glMatrix.vec3.subtract(this.forward, lookAt, this.position);
        glMatrix.vec3.cross(this.right, this.forward, up);
        glMatrix.vec3.cross(this.up, this.right, this.forward);
    
        glMatrix.vec3.normalize(this.forward, this.forward);
        glMatrix.vec3.normalize(this.right, this.right);
        glMatrix.vec3.normalize(this.up, this.up);
    }
    
    getViewMatrix() {
        const out = glMatrix.mat4.create();
        var lookAt = glMatrix.vec3.create();
        glMatrix.vec3.add(lookAt, this.position, this.forward);
        glMatrix.mat4.lookAt(out, this.position, lookAt, this.up);
        return out;
    }
};