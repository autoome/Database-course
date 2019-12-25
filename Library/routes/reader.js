'use strict';
const HTM=require('../lib').html;
const db=require("../coSqlite3")({file:'lib.db'});//数据库
const HTMSelect=require('../lib').htmlSelect;

//添加读者
exports.addReader = function *(req,res){
    let info = req.body;
    info.rID = info.rID || '';
    info.rName = info.rName || '';
    info.rSex = info.rSex || '';
    info.rDept = info.rDept || '';
    info.rGrade = info.rGrade || '';
    
    if(!info.rID || info.rID.length>8){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者ID不能为空且要在8个字符以内）"+HTM.end;
    }
    if(!info.rName || info.rName.length>10){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者姓名不能为空且要在10个字符以内）"+HTM.end;
    }
    if(!info.rSex || !(info.rSex==="女" || info.rSex==="男")){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者性别不能为空且必须为“男/女”）"+HTM.end;
    }
    if(!info.rDept || info.rDept.length>10){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者所在院系不能为空且要在10个字符以内）"+HTM.end;
    }
    if(!info.rGrade || info.rGrade<=0 || parseInt(info.rGrade)!=info.rGrade){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者年级不能为空且只能为正整数）"+HTM.end;
    }
    

    let sqlSearch = "select count(*) as cnt from reader where rID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.rID]);
    if(rows[0].cnt>0){
        return HTM.begin+"1</div>"+"该证号已经存在"+HTM.end;
        console.log('heihei');
    }

    let sql = "insert into reader(rID,rName,rSex,rDept,rGrade) values(?,?,?,?,?)";
    yield db.execSQL(sql,[info.rID,info.rName,info.rSex,info.rDept,info.rGrade]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}


//删除读者
exports.deleteReader = function *(req,res){
    let info = req.body;
    info.rID = info.rID || {};
    let sqlSearch = "select count(*) as cnt from reader where rID = ?";
    let rows = yield db.execSQL(sqlSearch,[info.rID]);
    if(rows[0].cnt == 0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }
    //如果尚有书籍未归还则不能删除
    let sqlCheck = "select count(*) as cnt from checkout where rID=? and (cRetdate='' or cRetdate=null)";
    let rowsCheck = yield db.execSQL(sqlCheck,[info.rID]);
    if(rowsCheck[0].cnt!=0){
        return HTM.begin+"2</div>"+"该读者尚有书籍未归还"+HTM.end;
    }

    let sql = "delete from reader where rID=?";
    yield db.execSQL(sql,[info.rID]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//修改读者，无法修改ID
exports.editReader = function *(req,res){
    let info = req.body;
    info.rID = info.rID || '';
    info.rName = info.rName || '';
    info.rSex = info.rSex || '';
    info.rDept = info.rDept || '';
    info.rGrade = info.rGrade || '';
    

    let sqlSearch = "select count(*) as cnt from reader where rID=?";
    let rows = yield db.execSQL(sqlSearch,[info.rID]);
    if(rows[0].cnt == 0){
        return HTM.begin+"1</div>"+"该证号不存在"+HTM.end;
    }

    if(!info.rID || info.rID.length>8){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者ID不能为空且要在8个字符以内）"+HTM.end;
    }
    if(!info.rName || info.rName.length>10){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者姓名不能为空且要在10个字符以内）"+HTM.end;
    }
    if(!info.rSex || !(info.rSex==="女" || info.rSex==="男")){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者性别不能为空且必须为“男/女”）"+HTM.end;
    }
    if(!info.rDept || info.rDept.length>10){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者所在院系不能为空且要在10个字符以内）"+HTM.end;
    }
    if(!info.rGrade || info.rGrade<=0 || parseInt(info.rGrade)!=info.rGrade){
        return HTM.begin+"2</div>"+"提交的参数有误：（读者年级不能为空且只能为正整数）"+HTM.end;
    }

    
    let sql = "update reader set rName=? , rSex=? , rDept=? , rGrade=? where rID=?";
    yield db.execSQL(sql,[info.rName,info.rSex,info.rDept,info.rGrade,info.rID]);
    return HTM.begin+"0</div>"+"成功"+HTM.end;
}

//查询读者
exports.searchReader = function *(req,res){
    let info = req.body;
    let htm="<table border=1 id='result'>";
    
    let cnd='';
    let sql = "select * from reader where 1=1";
    let sqlJudge = "select count(*) as cnt from reader where 1=1";

    //如果都没填
    if(!info.rSex && !info.rGrade0 && !info.rGrade1){
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql+=cnd;
        sqlJudge+=cnd;
        let rowsJudge = yield db.execSQL(sqlJudge);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //如果只填了性别
    if(info.rSex && !info.rGrade0 && !info.rGrade1){
        if(!(info.rSex==="女" || info.rSex==="男")){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rSex=?";
        sqlJudge=sqlJudge+cnd+" and rSex=?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rSex]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rSex]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }
    //只填rGrade0
    if(!info.rSex && info.rGrade0 && !info.rGrade1){
        if(info.rGrade0<=0 || parseInt(info.rGrade0)!=info.rGrade0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade>?";
        sqlJudge=sqlJudge+cnd+" and rGrade>?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade0]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade0]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //只填rGrade1
    if(!info.rSex && !info.rGrade0 && info.rGrade1){
        if(info.rGrade1<=0 || parseInt(info.rGrade1)!=info.rGrade1){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade<?";
        sqlJudge=sqlJudge+cnd+" and rGrade<?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade1]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade1]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //填了性别和rGrade0
    if(info.rSex && info.rGrade0 && !info.rGrade1){
        if(info.rGrade0<=0 || parseInt(info.rGrade0)!=info.rGrade0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(!(info.rSex==="女" || info.rSex==="男")){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade>? and rSex=?";
        sqlJudge=sqlJudge+cnd+" and rGrade>? and rSex=?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade0,info.rSex]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade0,info.rSex]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //填了性别和rGrade1
    if(info.rSex && !info.rGrade0 && info.rGrade1){
        if(info.rGrade1<=0 || parseInt(info.rGrade1)!=info.rGrade1){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(!(info.rSex==="女" || info.rSex==="男")){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade<? and rSex=?";
        sqlJudge=sqlJudge+cnd+" and rGrade<? and rSex=?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade1,info.rSex]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade1,info.rSex]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }
    //填了rGrade0和rGrade1
    if(!info.rSex && info.rGrade0 && info.rGrade1){
        if(info.rGrade1<=0 || parseInt(info.rGrade1)!=info.rGrade1){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rGrade0<=0 || parseInt(info.rGrade0)!=info.rGrade0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade>? and rGrade<?";
        sqlJudge=sqlJudge+cnd+" and rGrade>? and rGrade<?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade0,info.rGrade1]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade0,info.rGrade1]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }

    //全填了
    if(info.rSex && info.rGrade0 && info.rGrade1){
        if(info.rGrade1<=0 || parseInt(info.rGrade1)!=info.rGrade1){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rGrade0<=0 || parseInt(info.rGrade0)!=info.rGrade0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(!(info.rSex==="女" || info.rSex==="男")){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        if(info.rID) cnd +=" and rID like '%"+info.rID.replace(/\x27/g,"''")+"%'";
        if(info.rName) cnd +=" and rName like '%"+info.rName.replace(/\x27/g,"''")+"%'";
        if(info.rDept) cnd+=" and rDept like '%"+info.rDept.replace(/\x27/g,"''")+"%'";
        sql=sql+cnd+" and rGrade>? and rGrade<? and rSex=?";
        sqlJudge=sqlJudge+cnd+" and rGrade>? and rGrade<? and rSex=?";
        let rowsJudge = yield db.execSQL(sqlJudge,[info.rGrade0,info.rGrade1,info.rSex]);
        if(rowsJudge[0].cnt == 0){
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
        else{
            let rows = yield db.execSQL(sql,[info.rGrade0,info.rGrade1,info.rSex]);
            for(let row of rows){
                htm+="<tr><td>"+row.rID.toHTML()+"</td><td>"
                +row.rName.toHTML()+"</td><td>"+row.rSex.toHTML()+"</td><td>"
                +row.rDept.toHTML()+"</td><td>"+row.rGrade+"</td></tr>";
            }
            htm+="</table>";
            return HTMSelect.begin+htm+HTMSelect.end;
        }
    }
}

