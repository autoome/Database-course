/*
将data.json文件中的数据拼接成insert语句
*/
const path = require('path');
const fs = require('fs');

//读取data的内容
fs.readFile(path.join(__dirname,'../','data.json'),'utf8',(err,content)=>{
    if(err) return;
    let list = JSON.parse(content);
    let arr = [];
    //item为data中每一个对象，拼接字符串，使用模板字符串
    list.forEach((item)=>{
        let sql = `insert into Library(name,author,category,description) values('
        ${item.name}','${item.author}','${item.category}','${item.desc}');`;
        arr.push(sql);//放进arr数组
    });
    //将arr写入data.sql文件
    fs.writeFile(path.join(__dirname,'data.sql'),arr.join(''),'utf8',(err)=>{
        console.log('init data finished');
    });
});


