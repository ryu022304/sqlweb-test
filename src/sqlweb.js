import * as JsStore from "jsstore";
import * as SqlWeb from 'sqlweb';
const $ =  require('jquery');

// バックグラウンドで動かすためのWeb workerの設定
const workerPath = require("file-loader?name=scripts/jsstore.worker.js!../node_modules/jsstore/dist/jsstore.worker");
// --------------------------------------------------
// https://tshino.hatenablog.com/entry/20180106/1515218776
var newWorkerViaBlob = function(relativePath) {
    var baseURL = window.location.href.replace(/\\/g, '/').replace(/\/[^\/]*$/, '/');
    var array = ['importScripts("' + baseURL + relativePath + '");'];
    var blob = new Blob(array, {type: 'text/javascript'});
    var url = window.URL.createObjectURL(blob);
    return new Worker(url);
  };

var newWorker = function(relativePath) {
    try {
        return newWorkerViaBlob(relativePath);
    } catch (e) {
        return new Worker(relativePath);
    }
};
const worker = newWorker('dist/'+workerPath);
// --------------------------------------------------

// SQL Webを使用する宣言
JsStore.useSqlWeb(SqlWeb);
const con = new JsStore.Instance(worker);

// indexedDBの設定
const dbName = "sample_db";
const tbName = "sample_tb";

// indexedDBの初期化
initJsStore();

// データの表示
getTbData();

function initJsStore(){
    con.runSql(`ISDBEXIST ${dbName}`).then((isExist) => {
        if (isExist) {
            const qry = 'OPENDB ' + dbName;
            con.runSql(qry);
        } else {
            const qry = getDbQuery();
            con.runSql(qry);
            // 初期データの追加
            addData();
        }
    }).catch(err => {
        console.error(err);
    })
}

// 初期データの追加
function addData(){
    const data = [
        {name:'TARO', club:'baseball'},
        {name:'JIRO', club:'soccer'},
        {name:'SABU', club:'tennis'},
    ]
    data.forEach(val =>{
        const qry = `insert into ${tbName} values ({name: '${val.name}', club: '${val.club}'})`;
        con.runSql(qry);
    })
}

// DBとテーブルの初期化
function getDbQuery() {
    const db = `DEFINE DB ${dbName};`;
    const tblSampleQry = `
DEFINE TABLE ${tbName}(
id PRIMARYKEY AUTOINCREMENT,
name STRING NOTNULL ,
club STRING NOTNULL
);`;
    const dbCreatequery = db + tblSampleQry;
    return dbCreatequery;
}

// 現状のデータの表示
function getTbData() {
    con.runSql(`select * from ${tbName}`).then(res => {
        makeTable('now-table', res);
    });
}

// 入力されたSQLの実行
function execSql(){
    var sql = $('#sql-form [name=sql-form]').val();
    try{
        con.runSql(sql).then(res =>{
            makeTable('sql-result', res);
            getTbData();
        });
    }catch(e){
        alert("Type: "+e.type+" \nMessage: "+ e.message);
    }
}


// 表の動的作成
function makeTable(table_id, data){
    // 表を一旦削除
    document.getElementById(table_id).textContent = null;
    // 表の作成開始
    var rows=[];
    var table = document.createElement("table");
    table.border = 1;

    // 列のタイトル
    rows.push(table.insertRow(-1));
    for(var title in data[0]){
        var thObj = document.createElement("th");
        thObj.innerHTML = title;
        rows[0].appendChild(thObj);
    }

    // 表に2次元配列の要素を格納
    for(var i = 0; i < data.length; i++){
        rows.push(table.insertRow(-1));  // 行の追加
        //console.log(rows);
        for(var row in data[i]){
            var cell=rows[i+1].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][row]));
        }
    }
    // 指定したdiv要素に表を加える
    document.getElementById(table_id).appendChild(table);
    
}

$(function(){
    $('#exec').click(function(){
        execSql();
    })
})