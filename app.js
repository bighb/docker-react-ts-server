const Koa = require("koa");
const Router = require("koa-router");
const mysql = require("mysql2/promise");
const cors = require("@koa/cors"); // 引入koa-cors中间件

// 创建一个Koa应用
const app = new Koa();

// 使用koa-cors中间件
app.use(cors());

// 创建一个路由
const router = new Router();

// 创建一个数据库连接池
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "mysqldemo",
});

// 定义一个GET接口
router.get("/api/hello", async (ctx, next) => {
  try {
    // 获取分页参数，如果没有提供就使用默认值
    const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
    const size = ctx.query.size ? parseInt(ctx.query.size) : 10;

    // 计算偏移量
    const offset = (page - 1) * size;

    // 查询总数
    const [totalRows] = await pool.query(
      "SELECT COUNT(*) as total FROM customers"
    );
    const total = totalRows[0].total;

    // 使用连接池查询数据库
    const [rows, fields] = await pool.query(
      `SELECT * FROM customers LIMIT ${size} OFFSET ${offset}`
    );

    // 将查询结果返回给客户端
    ctx.body = {
      code: 200,
      message: "Success",
      data: {
        total: total,
        current: page,
        pageSize: size,
        list: rows,
      },
    };
  } catch (error) {
    ctx.body = {
      code: 500,
      message: "Internal Server Error",
      data: null,
    };
  }
});

// 将路由添加到应用中
app.use(router.routes()).use(router.allowedMethods());

// 定义应用监听的端口
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
