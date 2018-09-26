/**
* 绘制方格代码
*/
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    /**
    * step函数
    * step(a,b):当a小于b,返回0;a大于b,返回1
    * 将小于0.5的坐标点颜色值转为黑色
    * float left = step(0.5,st.x);
    * float bottom = step(0.5,st.y);
    * color = vec3( left * bottom );
    */
    // 精简代码 两个二分向量进行处理
    
    vec2 bl = step(vec2(0.3),st);
    vec2 tr = step(vec2(0.3),1.0-st);
    // 色值255转为0-1提供给GPU使用 当 x y 都为 1.0 时乘积才能是 1.0
    color = vec3(bl.x * bl.y * tr.x * tr.y);
    gl_FragColor = vec4(color,1.0);
}