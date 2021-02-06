#define LOG2 1.442695

precision mediump float;

varying vec2 fragTexCoord;
varying vec3 surfaceToView;

uniform vec3 fogColor;
uniform float fogDensity;

uniform sampler2D sampler;

void main()
{
	vec4 texel = texture2D(sampler, fragTexCoord);

	float fogDistance = length(surfaceToView);
	float fogAmount = 1. - exp2(-fogDensity * fogDensity * fogDistance * fogDistance * LOG2);
  	fogAmount = clamp(fogAmount, 0., 1.);

	gl_FragColor = vec4(mix(texel.rgb, fogColor, fogAmount), texel.a);
}