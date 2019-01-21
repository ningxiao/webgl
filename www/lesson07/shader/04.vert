#version 300 es
layout(location=0) in vec3 v3Position;
layout(location=1) in vec2 i_uv;//输入纹理的UV坐标 GLSL ES 3.00 版本以上使用
out vec2 out_uv;//将顶点着色器传入数据输出给片段着色器
void main(){
    out_uv = i_uv;
    gl_Position = vec4(v3Position,1.0);
}