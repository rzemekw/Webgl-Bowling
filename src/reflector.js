export default class Reflector {
    constructor(model, scene, focus, intensity) {
        this.model = model;
        this.scene = scene;
        this.focus = focus;
        this.intensity = intensity;
    }

    getWorld() {
        return this.model.worldMatrix;
    }

}