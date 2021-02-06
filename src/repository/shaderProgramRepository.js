import { maxReflectors, mirrorFsShaderPath, mirrorVsShaderPath, phongFsShaderPath, phongVsShaderPath, staticFsShaderPath, staticVsShaderPath } from "../consts/shaderConsts";
import { loadTextResource } from "./util";

function createProgram(gl, vsText, fsText) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsText);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsText);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        throw new Error('Error compiling fragment shader: ' + gl.getShaderInfoLog(fs))
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Error linking program: ' + gl.getProgramInfoLog(program))
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        throw new Error('Error validating program: ' + gl.getProgramInfoLog(program))
    }

    return program;
}

export default class ShaderProgramRepository {
    static async getPhongProgram(gl) {
        const [vs, fs] = await Promise.all([loadTextResource(phongVsShaderPath), loadTextResource(phongFsShaderPath)]);
        const program = createProgram(gl, vs, fs);

        program.uniforms = {
            mProj: gl.getUniformLocation(program, 'mProj'),
            mView: gl.getUniformLocation(program, 'mView'),
            mWorld: gl.getUniformLocation(program, 'mWorld'),

            ambientUniformLocation: gl.getUniformLocation(program, 'ambientLightIntensity'),
            sunlightDirUniformLocation: gl.getUniformLocation(program, 'sun.direction'),
            sunlightIntUniformLocation: gl.getUniformLocation(program, 'sun.color'),
            materialKd: gl.getUniformLocation(program, 'material.kd'),
            materialShininess: gl.getUniformLocation(program, 'material.shininess'),
            cameraPositionLocation: gl.getUniformLocation(program, 'cameraPosition'),
            fogDensityLocation: gl.getUniformLocation(program, 'fogDensity'),
            fogColorLocation: gl.getUniformLocation(program, 'fogColor'),

            reflectorsNumLocation: gl.getUniformLocation(program, 'reflectorsNum'),
            reflectorsLocations: [...Array(maxReflectors).keys()].map(i => ({
                focusLocation: gl.getUniformLocation(program, `reflectors[${i}].focus`),
                worldLocation: gl.getUniformLocation(program, `reflectors[${i}].world`),
                intensityLocation: gl.getUniformLocation(program, `reflectors[${i}].intensity`),
            }))
        };

        program.attribs = {
            vPos: gl.getAttribLocation(program, 'vertPosition'),
            vNorm: gl.getAttribLocation(program, 'vertNormal'),
            vTex: gl.getAttribLocation(program, 'vertTexCoord'),
        };

        return program;
    }

    static async getStaticProgram(gl) {
        const [vs, fs] = await Promise.all([loadTextResource(staticVsShaderPath), loadTextResource(staticFsShaderPath)]);
        const program = createProgram(gl, vs, fs)

        program.uniforms = {
            mProj: gl.getUniformLocation(program, 'mProj'),
            mView: gl.getUniformLocation(program, 'mView'),
            mWorld: gl.getUniformLocation(program, 'mWorld'),

            cameraPositionLocation: gl.getUniformLocation(program, 'cameraPosition'),
            fogDensityLocation: gl.getUniformLocation(program, 'fogDensity'),
            fogColorLocation: gl.getUniformLocation(program, 'fogColor'),
        };

        program.attribs = {
            vPos: gl.getAttribLocation(program, 'vertPosition'),
            vNorm: gl.getAttribLocation(program, 'vertNormal'),
            vTex: gl.getAttribLocation(program, 'vertTexCoord'),
        };

        return program;
    }

    static async getMirrorProgram(gl) {
        const [vs, fs] = await Promise.all([loadTextResource(mirrorVsShaderPath), loadTextResource(mirrorFsShaderPath)]);
        const program = createProgram(gl, vs, fs)

        program.uniforms = {
            mProj: gl.getUniformLocation(program, 'mProj'),
            mView: gl.getUniformLocation(program, 'mView'),
            mWorld: gl.getUniformLocation(program, 'mWorld'),
            mirrorMView: gl.getUniformLocation(program, 'mirrorMView'),
            mirrorMProj: gl.getUniformLocation(program, 'mirrorMProj'),
        }

        program.attribs = {
            vPos: gl.getAttribLocation(program, 'vertPosition'),
        };

        return program;
    }
}