import * as JsStore from "jsstore";

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
var connection = new JsStore.Instance(worker);

var dbName ='JsStore_Demo';

initJsStore();

var value = {
    itemName: 'Blue Jeans',
    price: 2000,
    quantity: 1000
}

//since Id is autoincrement column, so the value will be automatically generated.
connection.insert({
    into: 'Product',
    values: [value]
}).then(function(rowsInserted) {
    if (rowsInserted > 0) {
        alert('successfully added');
    }
}).catch(function(err) {
    console.log(err);
    alert(err.message);
});

connection.select({
    from: 'Product',
    where: {
        id: 5
    }
}).then(function(results) {
    // results will be array of objects
    alert(results.length + 'record found');
}).catch(function(err) {
    console.log(err);
    alert(err.message);
});

function initJsStore() {
    connection.isDbExist(dbName).then(function(isExist) {
        if (isExist) {
            connection.openDb(dbName);
        } else {
            var database = getDbSchema();
            connection.createDb(database);
        }
    }).catch(function(err) {
        console.error(err);
    })
}

function getDbSchema() {
  var tblProduct = {
    name: 'Product',
    columns: [
      {
          name: 'Id',
          primaryKey: true,
          autoIncrement: true
      }, 
      {
          name: 'ItemName',
          notNull: true,
          dataType: JsStore.DATA_TYPE.String
      }, 
      {
          name: 'Price',
          notNull: true,
          dataType: JsStore.DATA_TYPE.Number
      }, 
      {
          name: 'Quantity',
          notNull: true,
          dataType: JsStore.DATA_TYPE.Number
      }
    ]
  };
  var db = {
      name: dbName,
      tables: [tblProduct]
  }
  return db;
}