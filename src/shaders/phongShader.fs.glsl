#define MAX_REFLECTORS 20 

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

struct Reflector
{
	float focus;
	mat4 world;
	vec3 intensity;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;
varying vec3 surfaceToView;
varying vec3 fragVertPosition;

uniform Reflector reflectors[MAX_REFLECTORS];
uniform int reflectorsNum;
uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;
uniform Material material;
uniform sampler2D sampler;

void main()
{
	vec3 n = normalize(fragNormal);
	vec3 l = normalize(sun.direction);
	vec3 v = normalize(surfaceToView);

	vec3 r = normalize(2.0 * dot(n, l) * n - l);

	vec3 diffuseLight = sun.color * max(dot(n, l), 0.0);
	vec3 specularLight = sun.color * pow(max(dot(v, r), 0.0), material.shininess);

	for(int i = 0; i < MAX_REFLECTORS; i++) {
		if(i >= reflectorsNum) {
			break;
		} 
		vec3 lightPos = (reflectors[i].world * vec4(0,0,0,1)).xyz;
		vec3 reflectorDirection = normalize((reflectors[i].world * vec4(0,1,0,0)).xyz);
		vec3 lightDirection = lightPos - fragVertPosition;
		vec3 lightDirectionNorm = normalize(lightDirection);

		float lightDistance = length(lightDirection);

		vec3 reflectorIntensity = pow(max(dot(reflectorDirection, lightDirectionNorm), 0.0), reflectors[i].focus) * reflectors[i].intensity;
		reflectorIntensity *= (reflectors[i].focus / lightDistance / lightDistance);

		vec3 rr = normalize(2.0 * dot(n, lightDirectionNorm) * n - lightDirectionNorm);

		diffuseLight += reflectorIntensity * max(dot(n, lightDirectionNorm), 0.0);
		specularLight += reflectorIntensity * pow(max(dot(v, rr), 0.0), material.shininess);
		
	}
	
	vec4 texel = texture2D(sampler, fragTexCoord);

	vec3 lightIntensity = ambientLightIntensity +
		(1.0 - material.kd) * diffuseLight +
		material.kd * specularLight;

	gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
}