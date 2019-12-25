/*
业务模块，处理具体操作
*/
const data = require('./data.json');
const path = require('path');
const fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
var file = 'D:/Library-Manager/Sqlite_Operation/MyLibrary.db';
const app = express();
db = new sqlite3.Database(file);
var SqliteDB = require('D:/Library-Manager/mydb/sqlite.js').SqliteDB;
var sqliteDB = new SqliteDB(file);

printErrorInfo = function(err){
    console.log("Error Message:" + err.message + " ErrorNumber:" + errno);
};


//渲染主页面，主界面的内容全部从数据库查询并获得
exports.showIndex = (req,res)=>{
    let sql = 'select * from Library';
    db.all(sql,(err,rows)=>{
        if(err){
            res.send('Load failure');
        }
        else{//将rows提交给index页面
            res.render('index',{list : rows});
        }
    });

    
}
//跳转到添加图书的页面
exports.toAddBook = (req,res)=>{

    res.render('addBook',{});
}

//添加图书保存数据
exports.addBook = (req,res)=>{
    //获取表单数据
    let info = req.body;
    let book = {};
    for(let key in info){//表单数据全部放进book对象
        book[key] = info[key];
    }
    
    let sql = 'insert into Library values(?,?,?,?,?)';
    
    db.run(sql,[book.id,book.name,book.author,book.category,book.description],(err,rows)=>{
        if(err){
            throw(err);
        }
        if(rows == null){
            res.redirect('/');
        }
    });

}

//跳转编辑图书页面
exports.toEditBook = (req,res)=>{
    //获取id
    let id = req.query.id;
    let book = null;
    let sql = 'select * from Library where id =?'
    db.get(sql,[id],(err,rows)=>{
        if(err){
            res.send('Select failure');
        }
        else{
            res.render('editBook',rows);
        }
    });
    /*
    //去data里面找到该id
    data.forEach((item)=>{
        if(id == item.id){
            book = item;
            return; //找到跳出循环
        }
    });
    */
}

//编辑图书更新数据
exports.editBook = (req,res) =>{
    let info = req.body;
    /*
    data.forEach((item)=>{
        if(info.id == item.id){//id一样证明是我要编辑的那条数据
            for(let key in info){
                item[key] = info[key];//将item数据进行覆盖
            }
            return;
        } 
    });
    */

    let sql = 'update Library set name=?, author=?, category=?, description=? where id=?'
    db.run(sql,[info.name,info.author,info.category,info.description,info.id],(err,rows)=>{
        if(err){
            throw(err);
        }
        if(rows == null){
            res.redirect('/');
        }
    });
}
//删除图书
exports.deleteBook = (req,res)=>{
    let id = req.query.id;
    let sql = 'delete from Library where id=?';
    db.run(sql,[id],(err,rows)=>{
        if(err){
            res.send('delete failure');
        }
        if(rows==null){
            res.redirect('/');
        }
    });
}

//跳转到查询图书界面
exports.toSearchBook = (req,res)=>{
    res.render('searchBook',{});
}


//查询图书
exports.searchBook = (req,res)=>{
    //获取表单数据
    let info = req.body;
    let book = {};
    for(let key in info){//表单数据全部放进book对象
        book[key] = info[key];
    }
    if(book.name){
        let sql ='select * from Library where name=?';
        db.all(sql,[book.name],(err,rows)=>{
            if(err){
                res.send('search failure');
            }
            else{//将查询结果提交给searchResult界面
                res.render('searchResult',{list : rows});
            }
        });
    }
}

//返回主界面
exports.toIndex = (req,res)=>{
    res.redirect('/');
}