// SQL Webを使用する宣言
JsStore.useSqlWeb(SqlWeb);
const con = new JsStore.Instance(new Worker("src/jsstore.worker.min.js"));

// indexedDBの設定
const dbName = "sample_db";
const tbName = "sample_tb";

// indexedDBの初期化
initJsStore();

// データの表示
makeNowTable();

// データの参照
getTbData().then(res=>{
    console.log(res);
});

function initJsStore(){
    //let qry = new SqlWeb.Query(`ISDBEXIST ${dbName}`);
    con.runSql(`ISDBEXIST ${dbName}`).then((isExist) => {
        if (isExist) {
            let q = new SqlWeb.Query('OPENDB ' + dbName);
            con.runSql(q);
        } else {
            console.log(isExist);
            //let q = new SqlWeb.Query('DEFINE DB '+ dbName);
            //con.runSql('DEFINE DB '+ dbName);
            con.runSql('DEFINE DB tests');
            // 初期データの追加
            addData();
        }
    }).catch(err => {
        console.error(err);
    })
}

function addData(){
    const data = [
        {name:'TARO', club:'baseball'},
        {name:'JIRO', club:'soccer'},
        {name:'SABU', club:'tennis'},
    ]
    data.forEach(val =>{
        const qry = new SqlWeb.Query(`insert into ${tbName} values ({name: '${val.name}', club: '${val.club}'})`);
        con.runSql(qry);
    })
}

function getTbData() {
    const qry = new SqlWeb.Query(`select * from ${tbName}`);
    return con.runSql(qry);
}

function getDbQuery() {
    const db = `DEFINE DB ${dbName};`;
    const tblSampleQry = `DEFINE TABLE ${tbName}(id PRIMARYKEY AUTOINCREMENT,name STRING NOTNULL ,club STRING NOTNULL);`;
    const dbCreatequery = db + tblSampleQry;
    return dbCreatequery;
}

// 入力されたSQLの実行
function execSql(){
    var sql = $('#sql-form [name=sql-form]').val();
    console.log(sql);
}

// 表の動的作成
function makeNowTable(){
    // 表を一旦削除
    document.getElementById("now-table").textContent = null;
    // 表の作成開始
    var rows=[];
    var table = document.createElement("table");

    getTbData().then(data=>{
        // 表に2次元配列の要素を格納
        for(var i = 0; i < data.length; i++){
            rows.push(table.insertRow(-1));  // 行の追加
            //console.log(rows);
            for(var row in data[i]){
                var cell=rows[i].insertCell(-1);
                cell.appendChild(document.createTextNode(data[i][row]));
            }
        }
        // 指定したdiv要素に表を加える
        document.getElementById("now-table").appendChild(table);
    });
}

$(function(){
    $('#exec').click(function(){
        execSql();
        makeNowTable();
    })
})