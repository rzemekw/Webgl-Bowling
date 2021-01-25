precision mediump float;

attribute vec3 vertPosition;

varying vec3 fragVertPosition;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
  fragVertPosition = vertPosition;

  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}