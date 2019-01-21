precision mediump float;//精度限制
attribute vec3 v3Position;
attribute vec4 a_outColor;
attribute vec4 b_outColor;
varying vec4 outColor0;
varying vec4 outColor1;
void main(){
    outColor0 = a_outColor;
    outColor1 = b_outColor;
    gl_Position = vec4(v3Position,1.0);
}