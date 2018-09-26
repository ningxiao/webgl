/**
* 绘制方格代码
*/
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
float circle(in vec2 st, in float radius){
    float r = radius * 0.01;
    vec2 dist = st - vec2(0.5);
    /**
    * genType smoothstep (genType edge0,genType edge1,genType x)，genType smoothstep (float edge0,float edge1,genType x)
    * 如果x <= edge0，返回0.0 ；如果x >= edge1 返回1.0；如果edge0 < x < edge1，则执行0~1之间的平滑埃尔米特差值。如果edge0 >= edge1，结果是未定义的。
    * float dot (genType x, genType y)
    * 向量x，y之间的点积
    */
	return 1.0 - smoothstep(radius - r, radius + r, dot(dist, dist) * 6.0);
}
void main(){
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // 计算向量p0，p1之间的距离
    float pct = distance(st,vec2(0.5));
	// gl_FragColor = vec4(vec3(pct), 1.0 );
    gl_FragColor = vec4(vec3(circle(st,0.6)), 1.0 );
}