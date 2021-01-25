precision mediump float;

struct DirectionalLight
{
	vec3 direction;
	vec3 color;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;
varying vec3 surfaceToView;

uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
uniform sampler2D sampler;

void main()
{
	vec3 surfaceNormal = normalize(fragNormal);
	vec3 normSunDir = normalize(sun.direction);

	vec3 normSurfaceToView = normalize(surfaceToView);
	vec3 halfVector = normalize(normSunDir + normSurfaceToView);
	
	vec4 texel = texture2D(sampler, fragTexCoord);

	vec3 lightIntensity = ambientLightIntensity +
		sun.color * max(dot(fragNormal, halfVector), 0.0);

	gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}