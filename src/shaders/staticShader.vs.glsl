precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;
varying vec3 surfaceToView;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform vec3 cameraPosition;

void main()
{
  fragTexCoord = vertTexCoord;

  vec3 surfaceWorldPosition = (mWorld * vec4(vertPosition, 1.0)).xyz;
  surfaceToView = cameraPosition - surfaceWorldPosition;

  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}