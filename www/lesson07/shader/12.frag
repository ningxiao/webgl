#version 300 es
precision mediump float;
uniform sampler2D u_texture;//纹理对象 只能在片源着色器里面使用
in vec2 out_uv;//输出给片段着色器 需要和顶点着色器定义传入layout(location=0) 一致
out vec4 outColor;
uniform InBlock {  // 使用Block块实现多个shader共享
    vec3 draw;
} in_block;

vec4 discolor (vec4 bitmap){
    vec3 draw = in_block.draw;
    // float luminance = 0.299 * bitmap.r + 0.587 * bitmap.g + 0.114 * bitmap.b;
    float luminance = draw.r * bitmap.r + draw.g * bitmap.g + draw.b * bitmap.b;
    return vec4(luminance,luminance,luminance,1.0);
}
void main() {
    outColor = discolor(texture(u_texture,out_uv));
}