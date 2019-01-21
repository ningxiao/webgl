#ifdef GL_ES
precision mediump float;
#endif
varying vec4 outColor0;
varying vec4 outColor1;
void main() {
   gl_FragColor = (outColor1 + outColor0);
}
