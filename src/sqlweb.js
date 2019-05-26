import * as JsStore from "jsstore";
import * as SqlWeb from 'sqlweb';

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

// データの追加
addData();

// データの参照
getTbData().then(res=>{
    console.log(res);
});

function initJsStore(){
    con.runSql(`ISDBEXIST ${dbName}`).then((isExist) => {
        if (isExist) {
            const qry = 'OPENDB ' + dbName;
            con.runSql(qry);
        } else {
            const qry = getDbQuery();
            con.runSql(qry);
        }
    }).catch(err => {
        console.error(err);
    })
}

function addData(){
    const qry = `insert into ${tbName} values ({name:'TARO', club:'baseball'})`;
    con.runSql(qry).then(res => {
        return res;
    });
}

function getTbData() {
    return con.runSql(`select from ${tbName}`);
}

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