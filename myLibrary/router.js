/*
路由
*/
const express = require('express');
const router = express.Router();
const service = require('./service.js');

//路由处理，绑定在service模块里，在service里处理即可
//渲染主页
router.get('/',service.showIndex);
//添加图书（跳转到添加图书的页面）
router.get('/toAddBook',service.toAddBook);
//添加图书（提交表单需要post）
router.post('/addBook',service.addBook);
//跳转到编辑图书信息页面
router.get('/toEditBook',service.toEditBook);
//编辑图书后提交表单
router.post('/editBook',service.editBook);
//删除图书
router.get('/deleteBook',service.deleteBook);


//跳转到查询图书界面
router.get('/toSearchBook',service.toSearchBook);
//查询图书
router.post('/searchBook',service.searchBook);
//返回主界面
router.get('/toIndex',service.toIndex);
//module把router导出去app.use才能用
module.exports = router;
