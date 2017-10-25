/*********************************************************************************
 * Utils.js
 * webgl帮助类
 *
 * @version v1.0
 * @copyright 2001-2015 nxiao
 * @author nxiao <363305175@qq.com>
 * @license {@link https://github.com/ningxiao}
 *********************************************************************************/
const Utils = {};
/**
 * 检测是否支持touch事件
 * @param bool true 支持 false 不支持
 */
Utils.IsTouch = "ontouchend" in document ? true : false;
/**
 * 图片队列加载
 * @param  {[type]} srcs     [description]
 * @param  {[type]} imgs     [description]
 * @param  {[type]} complete [description]
 * @param  {[type]} progress [description]
 * @return {[type]}          [description]
 */
Utils.QueueImg = (urls, complete, progress) => {
    let key, url, index = arguments[3] || 0;
    let data = urls[index];
    let img = new Image();
    let bitmap = arguments[4] || {};
    for (key in data) {
        url = data[key];
    };
    img.onload = () => {
        bitmap[key] = img;
        index++;
        progress && progress.call(this, {
            "total": urls.length,
            "loaded": index
        });
        if (index != urls.length) {
            Utils.QueueImg.call(this, urls, complete, progress, index, bitmap);
        } else {
            complete.call(this, bitmap);
        };
    };
    img.crossOrigin = "Anonymous";
    img.src = url;
};
/**
 * 获取cavans的2D绘制对象
 * @param {[type]} canvas [description]
 */
Utils.GetContext = (canvas) => {
    if (canvas) {
        return canvas.getContext('2d');
    };
    return null;
};
/**
 * 获取canvas的webgl持有对象
 * @param {canvas} canvas 页面渲染对象
 * @param {boolean} opt_debug  是否开启调试模式
 * @param {function} opt_onerror 获取webgl异常是否存在回调函数
 * @return {gl} 成功返回 canvas 的webgl对象 失败返回 null
 */
Utils.WebGlContext = (canvas, opt_debug, opt_onerror) => {
    //兼容处理
    let gl, config = ['webg2', 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    if (opt_debug) {
        opt_onerror = opt_onerror || function(ev) {
            console.log('[WEBGL]: ', ev.statusMessage);
        };
        canvas.addEventListener('webglcontextlost', (ev) => {
            ev.preventDefault();
            console.log('[WEBGL]: ', ' Context Lost.');
        }, false);
        //监听webgl异常
        canvas.addEventListener('webglcontextcreationerror', opt_onerror, false);
        canvas.addEventListener('webglcontextrestored', (ev) => {
            console.log('[WEBGL]: ', 'Context Restored.');
        }, false);
    };
    for (var i = 0, l = config.length; i < l; i++) {
        try {
            gl = canvas.getContext(config[i], {
                antialias: true,
                stencil: true
            });
        } catch (err) {
            console.log(err);
        };
        if (gl) {
            break;
        };
    };
    if (!gl) {
        return null;
    };
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    return gl;
};
/**
 * 初始化渲染着色器
 * @param {webgl} gl             webgl对象
 * @param {[type]} vertexshader   初始化的顶点着色器
 * @param {[type]} fragmentshader 初始化的片段着色器
 * @return {program} program  成功返回 在js里面的渲染引用 失败返回 null
 */
Utils.WebProgram = (gl, vertexshader, fragmentshader) => {
    let program;
    if (!vertexshader || !fragmentshader) {
        return;
    };
    //创建 GPU在js的控制对象 program
    program = gl.createProgram();
    if (!program) {
        return;
    };
    //把着顶点色器传递给program
    gl.attachShader(program, vertexshader);
    //把着片源色器传递给program
    gl.attachShader(program, fragmentshader);
    //将program 对象链接到GPU
    gl.linkProgram(program);
    //获取链接并且进行验证
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('[WEBGL]: ', '渲染可执行程序: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        program = null;
    };
    //开始运行program
    gl.useProgram(program);
    return program;
};
/**
 * 缓冲区设置顶点着色器数据
 * @param {webgl} gl   canvas的webgl持有对象
 * @param {program} program   渲染着色器持有对象
 * @param {Float32Array} vertices Float32Array 的顶点数据
 * @param {int} size 顶点数据分量值 2 为x y 3 为x y z
 * @param {string} name 顶点着色器变量名称
 * @return {int} n  成功返回 渲染点的数量 失败返回 0
 */
Utils.InitVertexBuffers = (gl, program, vertices, size, name) => {
    var n, fsize, position, vertexbuffer;
    if (!(gl && vertices.length > 0 && size && name)) {
        console.log("传入参数错误");
        return 0;
    };
    fsize = vertices.BYTES_PER_ELEMENT;
    n = vertices.length / size;
    //创建一个gl的缓冲区对象
    vertexbuffer = gl.createBuffer();
    if (!vertexbuffer) {
        console.log("创建缓冲区对象失败");
        return 0;
    };
    //将缓冲区对象绑定到gl
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
    //创建一个缓冲区并且将数据写入
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    /**
        //创建一个指定内存大小的缓冲区 只有大小没有数据
        gl.bufferData(gl.ARRAY_BUFFER, fsize * vertices.length, gl.STATIC_DRAW);
        //更新指定区域数据 更新数据类型   更新偏移位置 数据
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    */
    //获取顶点着色器变量
    position = this.GetGpuLocation(gl, program, name);
    if (position < 0) {
        gl.deleteBuffer(vertexbuffer);
        console.log("获取WebGl顶点变量" + name + "失败");
        return 0;
    };
    //将缓冲区对象分配给着色器变量
    gl.vertexAttribPointer(position, size, gl.FLOAT, false, fsize * size, 0);
    //将顶点变量与分配的缓冲区对象连接起来
    gl.enableVertexAttribArray(position);
    return n;
};
/**
 * @param  {} gl webgl canvas的webgl持有对象
 * @param  {} key x-fragment 片源着色器 x-vertex 顶点着色器
 * @param  {} value GLSL语言源代码
 * @return {shader} shader  成功返回 对应着色器对象 失败返回 null
 */
Utils.WebGLShader = (gl, key, value) => {
    let shader;
    if (gl) {
        //创建gl着色器引用
        switch (key) {
            case "x-fragment": //片源着色器
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            case "x-vertex": //顶点着色器
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
            default:
                return;
        };
        //将glsl着色器代码传入
        gl.shaderSource(shader, value);
        //编译glsl着色器代码
        gl.compileShader(shader);
        //验证着glsl色器代码是否通过编译
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
            console.log('[WEBGL]: ', '无法编译着色器: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            shader = null;
        };
    };
    return shader;
};

/**
 * 获取GPU定义的变量引用
 * @param {webgl} gl      webgl对象
 * @param {Program} program   混合好顶点着色与片元着色的着色器
 * @param {String} name    获取对象名称
 * @param {boolean} isbool   false获取顶点片段变量 true获取片源着色器片段域
 * @return {int} 成功返回 是大于或者大于0的变量存储地址 -1为变量地址不存在
 */
Utils.GetGpuLocation = (gl, program, name, isbool) => {
    if (gl && program) {
        if (isbool) {
            //获取片源着色器变量失败返回null
            return gl.getUniformLocation(program, name) || -1;
        };
        //获取顶点着色器变量失败返回-1
        return gl.getAttribLocation(program, name);
    };
    return -1;
};

/**
 * 生成一个指定范围的随机数
 * @param {number} min 最小范围
 * @param {number} max 最小范围
 */
Utils.Random = function(min, max) {
    return Math.floor(min + Math.random() * (max - min));
};
/**
 * 传统鼠标的坐标转换为webgl坐标
 * @param  {int} cw   画布中心点
 * @param  {int} ch   画布中心点
 * @param  {int]} rect 画布的坐标
 * @param  {int} cx   鼠标点击x
 * @param  {int} cy   鼠标点击y
 * @return {int}      新的xy坐标
 */
Utils.LocalToGobal = (cw, ch, rect, cx, cy) => {
    var x = rect.left;
    var y = rect.top;
    x = ((cx - x) - cw) / cw;
    y = (ch - (cy - y)) / ch;
    return new Float32Array([x, y]);
};
/**
 * 获取鼠标在当前canvas的坐标
 * @param  {canvas} element [description]
 * @return {[type]}         [description]
 */
Utils.CaptureMouse = (element) => {
    var mouse = {
            x: 0,
            y: 0,
            event: null
        },
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;
    element.addEventListener('mousemove', (event) => {
        var x, y;
        if (event.pageX || event.pageY) {
            x = event.pageX;
            y = event.pageY;
        } else {
            x = event.clientX + body_scrollLeft + element_scrollLeft;
            y = event.clientY + body_scrollTop + element_scrollTop;
        }
        x -= offsetLeft;
        y -= offsetTop;
        mouse.x = x;
        mouse.y = y;
        mouse.event = event;
    }, false);
    return mouse;
};
/**
 * 在移动端进行坐标监听
 * @param  {canvas} element [description]
 * @return {[type]}         [description]
 */
Utils.CaptureTouch = (element) => {
    var touch = {
            x: null,
            y: null,
            isPressed: false,
            event: null
        },
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

    element.addEventListener('touchstart', (event) => {
        touch.isPressed = true;
        touch.event = event;
    }, false);

    element.addEventListener('touchend', (event) => {
        touch.isPressed = false;
        touch.x = null;
        touch.y = null;
        touch.event = event;
    }, false);

    element.addEventListener('touchmove', (event) => {
        var x, y, touch_event = event.touches[0];
        if (touch_event.pageX || touch_event.pageY) {
            x = touch_event.pageX;
            y = touch_event.pageY;
        } else {
            x = touch_event.clientX + body_scrollLeft + element_scrollLeft;
            y = touch_event.clientY + body_scrollTop + element_scrollTop;
        }
        x -= offsetLeft;
        y -= offsetTop;

        touch.x = x;
        touch.y = y;
        touch.event = event;
    }, false);

    return touch;
};
/**
 * [parseColor description]
 * @param  {[type]} color    [description]
 * @param  {[type]} toNumber [description]
 * @return {[type]}          [description]
 */
Utils.ParseColor = (color, toNumber) => {
    if (toNumber === true) {
        if (typeof color === 'number') {
            return (color | 0);
        };
        if (typeof color === 'string' && color[0] === '#') {
            color = color.slice(1);
        };
        return window.parseInt(color, 16);
    } else {
        if (typeof color === 'number') {
            color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
        };
        return color;
    };
};
/**
 * 将颜色转为rgba
 * @param  {[type]} color [description]
 * @param  {[type]} alpha [description]
 * @return {[type]}       [description]
 */
Utils.ColorToRGB = (color, alpha) => {
    var r, g, b, a;
    if (typeof color === 'string' && color[0] === '#') {
        color = window.parseInt(color.slice(1), 16);
    };
    alpha = (alpha === undefined) ? 1 : alpha;
    r = color >> 16 & 0xff;
    g = color >> 8 & 0xff;
    b = color & 0xff;
    a = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);
    if (a === 1) {
        return "rgb(" + r + "," + g + "," + b + ")";
    } else {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    };
};
/**
 * 检测某个点是否在指定矩形区域内
 * @param {object} rect {x:0,y:0,width:50,height:50}
 * @param {int} x
 * @param {int} y
 */
Utils.ContainsPoint = (rect, x, y) => {
    return !(x < rect.x || x > rect.x + rect.width || y < rect.y || y > rect.y + rect.height);
};
/**
 * 浏览器帧频对象 获取
 * @return {requestAnimationFrame}           requestAnimationFrame
 */
window.requestAnimationFrame || (window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
    setTimeout(callback, 1000 / 60);
});

/**
 * 浏览器帧频对象 关闭
 */
window.cancelAnimationFrame || (window.cancelAnimationFrame = window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || window.clearTimeout);