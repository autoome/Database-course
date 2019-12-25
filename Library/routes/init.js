'use strict';
const HTM=require('../lib').html;
const db=require("../coSqlite3")({file:'lib.db'});//数据库


//初始化数据库
exports.init = function *(req,res){
    try{
        let sqlBook = "create table if not exists book(bID varchar(30) primary key, bName varchar(30) not null"+
                      ", bPub varchar(30) not null, bDate date not null, bAuthor varchar(20) not null, bMem varchar(30) not null, bCnt integer not null"+
                      ", bRemain integer not null,check(bCnt>0) )";
        let sqlReader = "create table if not exists reader(rID varchar(8) primary key, rName varchar(10) not null"+
                        ", rSex varchar(30) not null, rDept varchar(10) not null, rGrade integer not null"+
                        ", CONSTRAINT chk_reader CHECK (rGrade>0 AND (rSex='男' or rSex='女')))";

        let sqlCheckout = "create table if not exists checkout(rID varchar(8) not null, bID varchar(30) not null"+",bName varchar(30) not null"+
                        ", cBordate date not null, cRetdate date, cReqdate date not null"+
                        ", primary key(rID,bID), FOREIGN KEY(rID) REFERENCES reader(rID), foreign KEY(bID) REFERENCES book(bID)"+
                        ",foreign key(bName) REFERENCES book(bName))";
        yield db.execSQL(sqlBook);
        yield db.execSQL(sqlReader);
        yield db.execSQL(sqlCheckout);
        }
    catch(error){
        return  HTM.begin+'1</div>'+'这里是错误信息，可根据你的情况输出'+HTM.end;
    }
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}


