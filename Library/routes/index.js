const reader = require('./reader');
const book = require('./book');
const initial = require('./init');
const app = require('../WebApp');

//数据库初始化
app.route('/init','post',initial.init);
//添加读者
app.route('/addReader','post',reader.addReader);
//删除读者
app.route('/deleteReader','post',reader.deleteReader);
//修改读者信息
app.route('/editReader','post',reader.editReader);
//查询读者
app.route('/searchReader','post',reader.searchReader);
//添加书籍
app.route('/addBook','post',book.addBook);
//删除书籍
app.route('/deleteBook','post',book.deleteBook);
//修改书籍信息
app.route('/editBook','post',book.editBook);
//查询书籍信息
app.route('/searchBook','post',book.searchBook);
//借书
app.route('/borrowBook','post',book.borrowBook);
//还书
app.route('/returnBook','post',book.returnBook);
//超期读者列表
app.route('/exceedTime','post',book.exceedTime);
//某个读者未还书信息
app.route('/dontReturn','post',book.dontReturn);
//增加书籍数量
app.route('/addCount','post',book.addCount);