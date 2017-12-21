import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  const html = 'hello';
  ctx.body = html;
  
  
});

app.use(router.routes());

app.listen(3000);
console.log('[demo] start-quick is starting at port 3000');
