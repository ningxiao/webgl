#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D texture;//纹理对象
varying vec2 out_uv;//输出给片段着色器
vec4 discolor (vec4 bitmap){
    float luminance = 0.299 * bitmap.r + 0.587 * bitmap.g + 0.114 * bitmap.b;
    return vec4(luminance,luminance,luminance,1.0);
}
void main() {
    gl_FragColor = discolor(texture2D(texture,out_uv));
}
