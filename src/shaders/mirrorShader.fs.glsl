precision mediump float;

varying vec3 fragVertPosition;
uniform sampler2D sampler;

uniform mat4 mirrorMProj;
uniform mat4 mirrorMView;

void main()
{

  	vec4 texCoord = (mirrorMProj * mirrorMView * vec4(fragVertPosition, 1.0));

	vec4 texel = texture2D(sampler, (texCoord / texCoord.w).xy / 2.0 + 0.5);

	gl_FragColor = vec4(texel.rgb, texel.a);
}