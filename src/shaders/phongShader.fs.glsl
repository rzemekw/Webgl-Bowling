precision mediump float;

struct DirectionalLight
{
	vec3 direction;
	vec3 color;
};

struct Material
{
	float kd;
	float shininess;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;
varying vec3 surfaceToView;

uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
uniform Material material;
uniform sampler2D sampler;

void main()
{
	vec3 n = normalize(fragNormal);
	vec3 l = normalize(sun.direction);
	vec3 v = normalize(surfaceToView);

	vec3 r = 2.0 * dot(n, l) * n - l;

	
	vec4 texel = texture2D(sampler, fragTexCoord);

	vec3 lightIntensity = ambientLightIntensity +
		(1.0 - material.kd) * sun.color * max(dot(n, l), 0.0) +
		material.kd * sun.color * pow(max(dot(v, r), 0.0), material.shininess);

	gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}