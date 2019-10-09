//node 常见的事件模型就是我们常见的订阅发布模式，核心API采用的就是异步事件驱动
//所有可能触发事件的对象都是一个继承自Emitter类的子对象，简单来说就是Node帮我们实现了订阅发布模式
const Emitter = require('events');
const http = require('http');
const request = require("./request");
const response = require("./response")
const context = require('./context')
const Stream = require('stream');
class Application extends Emitter {
    constructor() {
        super();
        this.middlewares = [];
        this.request = Object.create(request);
        this.response = Object.create(response);
        this.context = Object.create(context)
    }
    callback() {
        return (req, res) => {
            let fn = this.compose();
            const ctx = this.createContext(req, res);
            let respond = () => this.resposeBody(ctx)
            let error = (err) => this.onerror(err, ctx)
            return fn(ctx).then(respond).catch(error)
        }
    }
    compose() {
        if (!Array.isArray(this.middlewares)) throw new TypeError("middlewares must be array")
        for (let fn of this.middlewares) {
            if (typeof fn !== "function") throw new TypeError("middleware must be composed of function")
        }
        return async(ctx) => {
            let next = async() => {
                return Promise.resolve();
            }


            let len = this.middlewares.length - 1;
            for (let i = len; i >= 0; i--) {
                let currentMiddle = this.middlewares[i];
                next = creatNext(currentMiddle, next)
            }
            await next();

            function creatNext(currentMiddle, nextMiddle) {
                return async() => {
                    await currentMiddle(ctx, nextMiddle);
                }
            }
        }
    }
    onerror(err, ctx) {
        console.lof(ctx)
        if (err.code == "ENOENT") {
            ctx.status = 404;
        } else {
            ctx.status = 500;
        }
        let msg = err.message || "koa error";
        ctx.res.end(msg);
        this.emit("error", err);
    }
    resposeBody(ctx) {
        const res = ctx.res;
        let body = ctx.body;

        if (Buffer.isBuffer(body)) return res.end(body);
        if ('string' == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);
        body = JSON.stringify(body);
        if (!res.headersSent) {
            ctx.length = Buffer.byteLength(body);
        }
        res.end(body);
    }
    createContext(req, res) {
        //koa就是对node底层的转接
        let ctx = Object.create(this.context);
        ctx.request = Object.create(this.request);
        ctx.response = Object.create(this.response);
        ctx.req = ctx.request.req = req;
        ctx.res = ctx.response.res = res;
        return ctx;
    }
    use(middleware) {
        this.middlewares.push(middleware)
            //链式调用
        return this;
    }
    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }

}
module.exports = Application;