#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D texture;//纹理对象 只能在片源着色器里面使用
varying vec2 out_uv;//输出给片段着色器
uniform vec2 u_resolution;
uniform float u_time;
vec4 discolor (vec4 bitmap){
    float luminance = 0.299 * bitmap.r + 0.587 * bitmap.g + 0.114 * bitmap.b;
    return vec4(luminance,luminance,luminance,bitmap.a);
}
vec4 blur(vec4 bitmap) {
    float reverser =1.0 - bitmap.r;
    float reverseg =1.0 - bitmap.g;
    float reverseb =1.0 - bitmap.b;
    return vec4(reverser,reverseg,reverseb,bitmap.a);
}
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    if(u_time==1.0){
        if(st.x>0.5 && st.y<0.5){
            gl_FragColor = blur(texture2D(texture,out_uv));
        } else if(st.x<0.5 && st.y>0.5){
            gl_FragColor = discolor(texture2D(texture,out_uv));
        }else if(st.x>0.5 && st.y>0.5){
            discard; // 不绘制区域
        }else{
            gl_FragColor =texture2D(texture,out_uv);
        }
    }else{
        if(st.x>0.5 && st.y<0.5){
            gl_FragColor = discolor(texture2D(texture,out_uv));
        } else if(st.x<0.5 && st.y>0.5){
            gl_FragColor = blur(texture2D(texture,out_uv));
        }else{
            gl_FragColor =texture2D(texture,out_uv);
        }
    }
}
