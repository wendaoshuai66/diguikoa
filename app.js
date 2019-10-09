const Koa = require('./application');
const app = new Koa();

// logger

app.use(async(ctx, next) => {
    console.log(1)
    await next();
    console.log(5)
});

// x-response-time

app.use(async(ctx, next) => {
    console.log(2)
    await next();
    console.log(4)
});

// response

app.use(async ctx => {
    ctx.body = "hello"
    console.log(3)
});

app.listen(9000, () => {
    console.log('创建服务成功')
});