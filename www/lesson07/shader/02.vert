precision mediump float;//精度限制
attribute vec2 i_uv;//输入纹理的UV坐标
varying   vec2 out_uv;//将顶点着色器传入数据输出给片段着色器
struct NeSting {
  vec3 v3Position;
};
attribute vec3 v3Position;
void main(){
    out_uv = i_uv;
    gl_Position = vec4(v3Position,1.0);
}