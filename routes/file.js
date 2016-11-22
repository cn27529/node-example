var models = require('../models');
var express = require('express');
var router = express.Router();
var cool = require('cool-ascii-faces');
//var sendMail = require('../mail/sendMail');
var fs = require('fs');
var path = require('path');

//文件
//https://cn27529.gitbooks.io/mycloudlife-api/content/file.html

var multer = require('multer'); //https://github.com/expressjs/multer
var upload = multer({
    dest: 'public/'
});

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/')
//   },
//   filename: function (req, file, cb) {
//          var date = new Date();
//          var time1 = date.getTime();
//     cb(null, file.fieldname + '-' + time1)
//   }
// })
// var upload = multer({ storage: storage })

router.get('/', function(req, res) {
    res.send(cool());
    console.log(cool());
});

//router.post('/upload', function(req, res) {
router.post('/upload', upload.single('file'), function(req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    //res.send(req.file);
    var jsonExample = {
        fieldname: 'file',
        originalname: '螢幕快照 2016-11-14 22.29.48.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'public/',
        filename: 'cecaf4b376629d34593efbf0d4af20e8',
        path: 'public/cecaf4b376629d34593efbf0d4af20e8',
        size: 86041
    }
    var json = {
        msg: "ok,己上傳",
        err: "",
        filepath: req.file.path,
        size: req.file.size
    };
    res.send(json);

});

//取得所有圖片檔案
router.get('/allimage/', function(req, res) {

    var json = {
        id: 0,
        msg: "沒有資料",
        err: "",
        files: []
    }

    var dir = './public/';
    var files = fs.readdirSync(dir);
    files.forEach(function(filename, content) {
        var fullname = path.join(dir, filename);
        var stats = fs.statSync(fullname);
        //if (stats.isDirectory()) filename += '/';
        // process.stdout.write(filename + '\t' +
        //     stats.size + '\t' +
        //     stats.mtime + '\n'
        // );
        if (stats.isDirectory()) return;
        if (filename.length >= 32) onFileContent(filename, content);
        json.msg = "";
    });

    res.send(json);

    console.log(json);

    function onError(err) {
        json.msg = err.toString();
        json.err = "onError";
        console.log(err);
        res.send(json);
    }

    function onFileContent(filename, content) {
        var file = {
            name: filename,
            index: content
        };
        // file.name = filename;
        // file.index = content;
        json.files.push(file);
    }

});


//取得所有圖片檔案
router.get('/del/:filename', function(req, res) {

    var filename = req.params.filename;

    var json = {
            filename: filename,
            msg: "沒有資料可刪除",
            err: ""
        }
        //console.log(json);

    var path = './public/'; //路徑
    var filepath = path + filename; //檔案+路徑

    var exist = statPath(filepath);
    if (exist && exist.isFile()) {
        // do something
    } else {
        //不存在
        json.msg = 'ok,己刪除 ' + filepath;
        res.send(json);
        return;
    }

    //delete file
    fs.unlink(filepath, function(err) {
        if (err) {
            json.msg = err.toString(); //throw err;
            json.err = "fs.unlink";
            //return console.error(err);
        } else {
            json.msg = 'ok,己刪除 ' + filepath;
        }
        console.log(json);
        res.send(json);

    });

    function statPath(path) {
        try {
            return fs.statSync(path);
        } catch (ex) {}
        return false;
    }

});


module.exports = router;
