'use strict';
const HTM=require('../lib').html;
const db=require("../coSqlite3")({file:'lib.db'});//数据库
const HTMSelect=require('../lib').htmlSelect;

//添加书籍
exports.addBook = function *(req,res){
    let info = req.body;
    info.bID = info.bID || '';
    info.bName = info.bName || '';
    info.bPub = info.bPub || '';
    info.bDate = info.bDate || '';
    info.bAuthor = info.bAuthor || '';
    info.bMem = info.bMem || '';
    info.bCnt = info.bCnt || '';
    
    //YYYY-MM-DD的正则表达式
    let dateFormat =/^(\d{4})-(\d{2})-(\d{2})$/;
    
    if(!info.bID || info.bID.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍ID不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bName || info.bName.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍名字不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bPub || info.bPub.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（出版社不能为空且必须在30个字符以内）"+HTM.end;
    }
    if(!info.bDate || !(dateFormat.test(info.bDate))){
        return HTM.begin+"2</div>"+"提交的参数有误：（出版日期不能为空且日期格式只能为YYYY-MM-DD）"+HTM.end;
    }
    if(!info.bAuthor || info.bAuthor.length>20){
        return HTM.begin+"2</div>"+"提交的参数有误：（作者姓名不能为空且必须在20个字符以内）"+HTM.end;
    }
    if(!info.bMem || info.bMem.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（摘要不能为空且必须在30个字符以内）"+HTM.end;
    }
    if(!info.bCnt || info.bCnt<=0 || parseInt(info.bCnt)!=info.bCnt){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍数量不能为空且必须为正整数）"+HTM.end;
    }
    

    let sqlSearch = "select count(*) as cnt from book where bID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.bID]);
    if(rows[0].cnt>0){
        return HTM.begin+"1</div>"+"该书已经存在"+HTM.end;
        //console.log('heihei');
    }

    let sql = "insert into book(bId,bName,bPub,bDate,bAuthor,bMem,bCnt,bRemain) values(?,?,?,?,?,?,?,?)";
    yield db.execSQL(sql,[info.bID,info.bName,info.bPub,info.bDate,info.bAuthor,info.bMem,info.bCnt,info.bCnt]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//增加书籍数量
exports.addCount = function*(req,res){
    let info = req.body;
    info.bID = info.bID || {};
    info.bCnt = info.bCnt || {};
    let sqlSearch = "select count(*) as cnt from book where bID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.bID]);
    if(rows[0].cnt == 0){
        return HTM.begin+"1</div>"+"该书不存在"+HTM.end;
    }
    if(!info.bID || info.bID.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍ID不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bCnt || info.bCnt<=0 || parseInt(info.bCnt)!=info.bCnt){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍数量不能为空且必须为正整数）"+HTM.end;
    }
    let sqlRemain = "select bRemain from book where bID=?";
    let rowsRemain = yield db.execSQL(sqlRemain,[info.bID]);
    let sqlCnt = "select bCnt from book where bID=?";
    let rowsCnt = yield db.execSQL(sqlCnt,[info.bID]);
    let sql = "update book set bCnt=? , bRemain=? where bID=?";
    yield db.execSQL(sql,[parseInt(info.bCnt)+parseInt(rowsCnt[0].bCnt),parseInt(info.bCnt)+parseInt(rowsRemain[0].bRemain), info.bID]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//删除书籍
exports.deleteBook = function *(req,res){
    let info = req.body;
    info.bID = info.bID || {};
    info.bCnt = info.bCnt || {};

    let sqlSearch = "select count(*) as cnt from book where bID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.bID]);
    if(rows[0].cnt == 0){
        return HTM.begin+"1</div>"+"该书不存在"+HTM.end;
    }
    let deleteCnt = info.bCnt;
    let sqlRemain = "select bRemain from book where bID=?";
    let rowsRemain = yield db.execSQL(sqlRemain,[info.bID]);
    let sqlCnt = "select bCnt from book where bID=?";
    let rowsCnt = yield db.execSQL(sqlCnt,[info.bID]);

    if(rowsRemain[0].bRemain - deleteCnt <0){
        return HTM.begin+"2</div>"+"减少的数量大于该书目前在库数量"+HTM.end;
    }
    if(!info.bID || info.bID.length>30){
        return HTM.begin+"3</div>"+"提交的参数有误：（书籍ID不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bCnt || info.bCnt<=0 || parseInt(info.bCnt)!=info.bCnt){
        return HTM.begin+"3</div>"+"提交的参数有误：（书籍数量不能为空且必须为正整数）"+HTM.end;
    }

    

    //删除书
    if(rowsRemain[0].bRemain == deleteCnt && rowsRemain[0].bRemain==rowsCnt[0].bCnt){
        let sqlDelete = "delete from book where bID=?";
        yield db.execSQL(sqlDelete,[info.bID]);
        return HTM.begin+"0</div>"+"成功"+HTM.end;
    }

    let sqlUpdate = "update book set bCnt=? ,bRemain=? where bID=?";
    yield db.execSQL(sqlUpdate,[parseInt(rowsCnt[0].bCnt)-parseInt(deleteCnt),parseInt(rowsRemain[0].bRemain)-parseInt(deleteCnt),info.bID]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//修改书籍信息
exports.editBook = function *(req,res){
    let info = req.body;
    info.bID = info.bID || '';
    info.bName = info.bName || '';
    info.bPub = info.bPub || '';
    info.bDate = info.bDate || '';
    info.bAuthor = info.bAuthor || '';
    info.bMem = info.bMem || '';
    

    let sqlSearch = "select count(*) as cnt from book where bID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.bID]);
    if(rows[0].cnt<=0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }
    //YYYY-MM-DD的正则表达式
    let dateFormat =/^(\d{4})-(\d{2})-(\d{2})$/;
    
    if(!info.bID || info.bID.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍ID不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bName || info.bName.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（书籍名字不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.bPub || info.bPub.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（出版社不能为空且必须在30个字符以内）"+HTM.end;
    }
    if(!info.bDate || !(dateFormat.test(info.bDate))){
        return HTM.begin+"2</div>"+"提交的参数有误：（出版日期不能为空且日期格式只能为YYYY-MM-DD）"+HTM.end;
    }
    if(!info.bAuthor || info.bAuthor.length>20){
        return HTM.begin+"2</div>"+"提交的参数有误：（作者姓名不能为空且必须在20个字符以内）"+HTM.end;
    }
    if(!info.bMem || info.bMem.length>30){
        return HTM.begin+"2</div>"+"提交的参数有误：（摘要不能为空且必须在30个字符以内）"+HTM.end;
    }
    

    
    //修改书籍
    let sql = "update book set bName=?,bPub=?,bDate=?,bAuthor=?,bMem=? where bID=?";
    yield db.execSQL(sql,[info.bName,info.bPub,info.bDate,info.bAuthor,info.bMem,info.bID]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//查询书籍
exports.searchBook = function *(req,res){
    let info = req.body;
    let htm="<table border=1 id='result'>";
    
    //除去日期都要模糊查询
    if(!info.bDate0 && !info.bDate1){ //如果bDate0和bDate1都没填
        let sql ="select * from book where 1=1";
        let sqlJudge = "select count(*) as cnt from book where 1=1";
        var cnd="";
        if(info.bID) 
            cnd+=" and bID like '%"+info.bID.replace(/\x27/g,"''")+"%'";
        if(info.bName)
            cnd+=" and bName like '%"+info.bName.replace(/\x27/g,"''")+"%'";
        if(info.bPub)
            cnd+=" and bPub like '%"+info.bPub.replace(/\x27/g,"''")+"%'";
        if(info.bAuthor)
            cnd+=" and bAuthor like '%"+info.bAuthor.replace(/\x27/g,"''")+"%'";
        if(info.bMem)
            cnd+=" and bMem like '%"+info.bMem.replace(/\x27/g,"''")+"%'";
        sql+=cnd;
        sqlJudge+=cnd;
        let rowsJudge = yield db.execSQL(sqlJudge);
        if(rowsJudge[0].cnt == 0){ //没有符合的
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{  //有符合的
            let rows = yield db.execSQL(sql);
            for(let row of rows){
                htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"+row.bName+"</td><td>"+row.bCnt+"</td><td>"
                +row.bRemain+"</td><td>"+row.bPub.toHTML()+"</td><td>"
                +row.bDate.toHTML()+"</td><td>"+row.bAuthor.toHTML()+"</td><td>"+row.bMem.toHTML()+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }
    
    //只填了bDate0
    if(info.bDate0 && !info.bDate1){ 
        //YYYY-MM-DD的正则表达式
        let dateFormat =/^(\d{4})-(\d{2})-(\d{2})$/;
        if(!(dateFormat.test(info.bDate0))){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        let sql ="select * from book where 1=1";
        let sqlJudge = "select count(*) as cnt from book where 1=1";
        var cnd="";
        if(info.bID) 
            cnd+=" and bID like '%"+info.bID.replace(/\x27/g,"''")+"%'";
        if(info.bName)
            cnd+=" and bName like '%"+info.bName.replace(/\x27/g,"''")+"%'";
        if(info.bPub)
            cnd+=" and bPub like '%"+info.bPub.replace(/\x27/g,"''")+"%'";
        if(info.bAuthor)
            cnd+=" and bAuthor like '%"+info.bAuthor.replace(/\x27/g,"''")+"%'";
        if(info.bMem)
            cnd+=" and bMem like '%"+info.bMem.replace(/\x27/g,"''")+"%'";
        sql = sql+cnd+" and bDate>?";
        sqlJudge = sqlJudge+cnd+" and bDate>?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.bDate0]);
        if(rowsJudge[0].cnt == 0){ //没有符合的
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{  //有符合的
            let rows = yield db.execSQL(sql,[info.bDate0]);
            for(let row of rows){
                htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"+row.bName+"</td><td>"+row.bCnt+"</td><td>"
                +row.bRemain+"</td><td>"+row.bPub.toHTML()+"</td><td>"
                +row.bDate.toHTML()+"</td><td>"+row.bAuthor.toHTML()+"</td><td>"+row.bMem.toHTML()+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //只填了bDate1
    if(!info.bDate0 && info.bDate1){ 
        //YYYY-MM-DD的正则表达式
        let dateFormat =/^(\d{4})-(\d{2})-(\d{2})$/;
        if(!(dateFormat.test(info.bDate1))){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        let sql ="select * from book where 1=1";
        let sqlJudge = "select count(*) as cnt from book where 1=1";
        var cnd="";
        if(info.bID) 
            cnd+=" and bID like '%"+info.bID.replace(/\x27/g,"''")+"%'";
        if(info.bName)
            cnd+=" and bName like '%"+info.bName.replace(/\x27/g,"''")+"%'";
        if(info.bPub)
            cnd+=" and bPub like '%"+info.bPub.replace(/\x27/g,"''")+"%'";
        if(info.bAuthor)
            cnd+=" and bAuthor like '%"+info.bAuthor.replace(/\x27/g,"''")+"%'";
        if(info.bMem)
            cnd+=" and bMem like '%"+info.bMem.replace(/\x27/g,"''")+"%'";
        sql = sql+cnd+" and bDate<?";
        sqlJudge = sqlJudge+cnd+" and bDate<?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.bDate1]);
        if(rowsJudge[0].cnt == 0){ //没有符合的
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{  //有符合的
            let rows = yield db.execSQL(sql,[info.bDate1]);
            for(let row of rows){
                htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"+row.bName+"</td><td>"+row.bCnt+"</td><td>"
                +row.bRemain+"</td><td>"+row.bPub.toHTML()+"</td><td>"
                +row.bDate.toHTML()+"</td><td>"+row.bAuthor.toHTML()+"</td><td>"+row.bMem.toHTML()+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //填了bDate0和bDate1
    if(info.bDate0 && info.bDate1){ 
        //YYYY-MM-DD的正则表达式
        let dateFormat =/^(\d{4})-(\d{2})-(\d{2})$/;
        if(!(dateFormat.test(info.bDate0)) || !(dateFormat.test(info.bDate1))){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        let sql ="select * from book where 1=1";
        let sqlJudge = "select count(*) as cnt from book where 1=1";
        var cnd="";
        if(info.bID) 
            cnd+=" and bID like '%"+info.bID.replace(/\x27/g,"''")+"%'";
        if(info.bName)
            cnd+=" and bName like '%"+info.bName.replace(/\x27/g,"''")+"%'";
        if(info.bPub)
            cnd+=" and bPub like '%"+info.bPub.replace(/\x27/g,"''")+"%'";
        if(info.bAuthor)
            cnd+=" and bAuthor like '%"+info.bAuthor.replace(/\x27/g,"''")+"%'";
        if(info.bMem)
            cnd+=" and bMem like '%"+info.bMem.replace(/\x27/g,"''")+"%'";
        sql = sql+cnd+" and bDate>? and bDate<?";
        sqlJudge = sqlJudge+cnd+" and bDate>? and bDate<?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.bDate0, info.bDate1]);
        if(rowsJudge[0].cnt == 0){ //没有符合的
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{  //有符合的
            let rows = yield db.execSQL(sql,[info.bDate0, info.bDate1]);
            for(let row of rows){
                htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"+row.bName+"</td><td>"+row.bCnt+"</td><td>"
                +row.bRemain+"</td><td>"+row.bPub.toHTML()+"</td><td>"
                +row.bDate.toHTML()+"</td><td>"+row.bAuthor.toHTML()+"</td><td>"+row.bMem.toHTML()+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

}

//借阅书籍
exports.borrowBook = function *(req,res){
    let info = req.body;
    

    //证号不存在
    let sqlSearchReader = "select count(*) as cnt from reader where rID = ?";
    let rowsReader = yield db.execSQL(sqlSearchReader,[info.rID]);
    if(rowsReader[0].cnt == 0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }

    //书号不存在
    let sqlSearchBook = "select count(*) as cnt from book where bID = ?";
    let rowsBook = yield db.execSQL(sqlSearchBook,[info.bID]);
    if(rowsBook[0].cnt == 0){
        return HTM.begin+"2</div>"+"该书号不存在"+HTM.end;
    }
    
    //当前日期
    let myDate = new Date();
    let nowDate= myDate.toLocaleDateString();

    //待还日期
    myDate.setDate(myDate.getDate() + 31);
	var m = myDate.getMonth() + 1;
    var requireDate = myDate.getFullYear() + '-' + m + '-' + myDate.getDate();
    
    //有超期的书没还
    let sqlExceed = "select count(*) as cnt from checkout where rID=? and cReqdate<? and (cRetdate='' or cRetdate is null)";
    let rowsExceed = yield db.execSQL(sqlExceed,[info.rID, nowDate]);
    if(rowsExceed[0].cnt!=0){
        return HTM.begin+"3</div>"+"该读者有超期书未还"+HTM.end;
    }
    
    //该读者已借阅该书，且未归还
    let sqlDontReturn = "select count(*) as cnt from checkout where rID=? and bID=? and (cRetdate='' or cRetdate is null)";
    let rowsDontReturn = yield db.execSQL(sqlDontReturn,[info.rID, info.bID]);
    if(rowsDontReturn[0].cnt!=0){
        return HTM.begin+"4</div>"+"该读者已经借阅该书，且未归还"+HTM.end;
    }

    let sqlRemain = "select bRemain from book where bID=?";
    let rowsRemain = yield db.execSQL(sqlRemain,[info.bID]);
    if(rowsRemain[0].bRemain == 0){
        return HTM.begin+"5</div>"+"该书已经全部借出"+HTM.end;
    }

    //书号或者证号为空或不符合要求
    info.rID = info.rID || '';
    info.bID = info.bID || '';
    if(!info.bID || info.bID.length>30){
        return HTM.begin+"6</div>"+"（书籍ID不能为空且要在30个字符以内）"+HTM.end;
    }
    if(!info.rID || info.rID.length>8){
        return HTM.begin+"6</div>"+"（读者ID不能为空且要在8个字符以内）"+HTM.end;
    }
    //该书在库数量减1
    let sqlReduce = "update book set bRemain=bRemain-1 where bID=?"
    yield db.execSQL(sqlReduce,[info.bID]);
    //插入书名
    let sqlName = "select bName from book where bID=?";
    let rowsName = yield db.execSQL(sqlName,[info.bID]);

    //更新借阅日期及待还日期
    let sql = "insert into checkout values(?,?,?,?,?,?)";
    yield db.execSQL(sql,[info.rID,info.bID,rowsName[0].bName,nowDate,"",requireDate]);

    return HTM.begin+"0</div>"+"成功"+HTM.end;
}


//归还书籍
exports.returnBook = function * (req,res){
    let info = req.body;

    //证号不存在
    let sqlSearchReader = "select count(*) as cnt from reader where rID = ?";
    let rowsReader = yield db.execSQL(sqlSearchReader,[info.rID]);
    if(rowsReader[0].cnt == 0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }

    //书号不存在
    let sqlSearchBook = "select count(*) as cnt from book where bID = ?";
    let rowsBook = yield db.execSQL(sqlSearchBook,[info.bID]);
    if(rowsBook[0].cnt == 0){
        return HTM.begin+"2</div>"+"该书号不存在"+HTM.end;
    }

    //该读者并未借阅该书
    let sqlDontBorrow = "select count(*) as cnt from checkout where rID=? and bID=?";
    let rowsDontBorrow = yield db.execSQL(sqlDontBorrow,[info.rID,info.bID]);
    if(rowsDontBorrow[0].cnt == 0){
        return HTM.begin+"3</div>"+"该读者并未借阅该书"+HTM.end;
    }
    //当前日期
    let myDate = new Date();
    let nowDate= myDate.toLocaleDateString();
    //该书在库数量加1
    let sqlAdd = "update book set bRemain=bRemain+1 where bID=?";
    yield db.execSQL(sqlAdd,[info.bID]);
    //更新归还日期
    let sql = "update checkout set cRetdate=? where rID=? and bID=?";
    yield db.execSQL(sql,[nowDate,info.rID,info.bID]);

    
    //归还之后将其删除
    let sqlDelete = "delete from checkout where bID=? and rID=?";
    yield db.execSQL(sqlDelete,[info.bID,info.rID]);

    return HTM.begin+"0</div>"+"成功"+HTM.end;
}


//查询超期读者列表
exports.exceedTime = function *(req,res){
    //当前日期
    var myDate = new Date();
    var nowDate= myDate.toLocaleDateString();
    var htm="<table border=1 id='result'>";
    //没有超期的，输出空列表
    let sqlAll = 'select count(*) as cnt from checkout where cReqdate<? and (cRetdate="" or cRetdate is null)';
    let rowsAll = yield db.execSQL(sqlAll,[nowDate]);
    if(rowsAll[0].cnt == 0){
        htm+="</table>";
        return HTMSelect.begin+htm+HTMSelect.end;
    }


    let sqlReader = "select distinct rID,rName,rSex,rDept,rGrade from reader where rID in (select rID from checkout where cReqdate<? and (cRetdate='' or cRetdate is null))";
    let rows = yield db.execSQL(sqlReader,[nowDate]);
    for(let row of rows){
            htm+= "<tr><td>"+row.rID.toHTML()+"</td><td>"+row.rName+"</td><td>"
            +row.rSex.toHTML()+"</td><td>"+row.rDept.toHTML()+"</td><td>"
            +row.rGrade+"</td></tr>";
    }
   
    htm+="</table>";
    return HTMSelect.begin+htm+HTMSelect.end;
}


//查看某个读者的未还书信息
exports.dontReturn = function *(req,res){
    let info = req.body;
    //证号不存在
    let sqlSearchReader = "select count(*) as cnt from reader where rID = ?";
    let rowsReader = yield db.execSQL(sqlSearchReader,[info.rID]);
    if(rowsReader[0].cnt == 0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }
    //查询该证号的未还书信息
    let htm="<table border=1 id='result'>";
    let sqlSelect = "select * from checkout where rID=? and (cRetdate='' or cRetdate is null)";
    let rowsSelect = yield db.execSQL(sqlSelect,[info.rID]);
    //如果没有符合条件的
    let sqlCnt = "select count(*) as cnt from checkout where rID=? and (cRetdate='' or cRetdate is null)";
    let rowsCnt = yield db.execSQL(sqlCnt,[info.rID]);
    if(rowsCnt[0].cnt == 0){
        htm+="</table>";
        return HTMSelect.begin+htm+HTMSelect.end;
    }

    //如果有符合条件的
    for(let row of rowsSelect){
        //当前日期
        let myDate = new Date();
        let nowDate= myDate.toLocaleDateString();
        //判断当前读者的当前书籍是否超期
        let sqlExceed = "select count(*) as cnt from checkout where rID=? and bID=? and (cRetdate='' or cRetdate is null) and cReqdate<?";
        let rowsExceed = yield db.execSQL(sqlExceed,[info.rID,row.bID,nowDate]);
        if(rowsExceed[0].cnt > 0){ //如果这一条超期
            htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"
            +row.bName.toHTML()+"</td><td>"
            +row.cBordate.toHTML()+"</td><td>"+row.cReqdate.toHTML()+"</td><td>"+"是".toHTML()+"</td></tr>";
        }
        else{//该条没有超期
            htm+="<tr><td>"+row.bID.toHTML()+"</td><td>"
            +row.bName.toHTML()+"</td><td>"
            +row.cBordate.toHTML()+"</td><td>"+row.cReqdate.toHTML()+"</td><td>"+"否".toHTML()+"</td></tr>";
        }
    }
    htm+="</table>";
    return HTMSelect.begin+htm+HTMSelect.end;
}
