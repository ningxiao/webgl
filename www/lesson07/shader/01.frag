precision mediump float;//精度限制
uniform vec2 u_resolution;
uniform int u_type;
vec3 pix(vec3 v){
    float s = (v.r + v.g + v.b) / 3.0;//平均值灰度算法
    return vec3(s);
}
float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) - smoothstep( pct, pct+0.02, st.y);
}
void main(){
    vec2 st = gl_FragCoord.xy / u_resolution;
    if(u_type > 0){
        float y = pow(st.x,5.0);
        float pct = plot(st,y);
        vec3 color = vec3(y);
        color = (1.0-pct) * color + pct * vec3(0.0,1.0,0.0);
        gl_FragColor = vec4(color,1.0);
    }else{
        gl_FragColor = vec4(st.x,st.y,0.0,1.0);
        gl_FragColor = vec4(pix(vec3(st.x,st.y,0.0)),1.0);
    }
}