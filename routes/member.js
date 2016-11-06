var models = require('../models');
var express = require('express');
var router = express.Router();
var cool = require('cool-ascii-faces');

//文件
//https://cn27529.gitbooks.io/mycloudlife-api/content/member.html

//create
router.post('/create', function(req, res) {

    //token檢查, 先不檢查
    //var token = req.body.token;
    var id = req.body.id;
    var email = req.body.member.email;
    var tag = req.body.member.tag;

    var json = {
        id: 0,
        msg: "建立過程有錯誤請查看值的正確性",
        err: ""
    }

    models.Member.findOrCreate({
            where: {
                AccountId: id,
                email: email,
                tag: tag
            },
            defaults: {
                email: email,
                tag: tag,
                AccountId: id
            }
        })
        .spread(function(data, created) {
            console.log(data.get({
                    plain: true
                }))
                //console.log(data);
            json = {
                "id": data.id, //這是資料代碼
                "msg": "ok,資料己建立"
            }
            res.json(json);

        }).catch(function(err) {
            // handle error;
            console.log(err);
            json.err = "sql";
            //json.msg = "";
            res.json(json);
        });

});



//刪除資料
router.get('/del/:id', function(req, res) {

    var id = req.params.id;

    var json = {
        id: id,
        msg: "沒有資料可刪除",
        err: ""
    }

    models.Member.findOne({
        where: {
            id: id
        }
    }).then(function(data) {

        console.log(data);

        if (data != null) {

            models.Member.destroy({
                    where: {
                        id: req.params.id
                    }
                })
                .then(function(data) {
                    console.log(data);

                    json.msg = "ok,刪除";
                    json.id = data.id;
                    res.json(json);
                });

        } else {
            res.json(json);
        }

    }).catch(function(err) {
        // handle error;
        console.log(err);
        json.err = "sql";
        json.msg = "";
        res.json(json);
    });

});

//以email查我的成員
router.get('/email/:email', function(req, res) {

    var email = req.params.email;
    //var token = req.params.token; //先不檢查
    var json = {
        id: 0,
        msg: "沒有找到資料",
        err: "",
        members: []
    }

    models.Member.findOne({
        where: {
            email: req.params.email
        }
    }).then(function(data) {

        //console.log(data);
        if (data != null) {
            json.msg = "ok";
            json.id = data.id;
            json.members = data;
        }
        res.json(json);

    }).catch(function(err) {
        // handle error;
        console.log(err);
        json.err = "sql";
        //json.msg = err.message;
        res.json(json);
    });
    //res.send(cool());
    //console.log(cool());

});

//取得我的成員
router.get('/acc/:id/:tag', function(req, res) {

    var id = req.params.id;
    var tag = req.params.tag;
    //var token = req.params.token; //先不檢查
    var json = {
        id:"",
        msg: "沒有資料",
        err: "",
        members:[]
    }

    models.Member.findAll({
      where: {
          AccountId: id,
          tag: tag
      }
    }).then(function(data) {

        //if (keyword != "Q_QtaiwanQvQ") data = cool();
        //console.log(data);
        json.id= id;
        json.msg="ok";
        json.members = data;
        res.json(json);

    }).catch(function(err) {
        // handle error;
        console.log(err);
        json.err = "sql";
        //json.msg = err.message;
        res.json(json);

    });

    //res.send(cool());
    //console.log(cool());

});


router.get('/id/:id', function(req, res) {

    var id = req.params.id;
    //var token = req.params.token; //先不檢查
    var json = {
        id: 0,
        msg: "沒有找到資料",
        err: "",
        note: null
    }

    models.Member.findOne({
        where: {
            id: id
        }
    }).then(function(data) {

        //console.log(data);
        if (data != null) {
            json.msg = "ok";
            json.id = data.id;
            json.note = data;
        }
        res.json(json);

    }).catch(function(err) {
        // handle error;
        console.log(err);
        json.err = "sql";
        //json.msg = err.message;
        res.json(json);
    });
    //res.send(cool());
    //console.log(cool());

});

//all的通關密語是Q_QtaiwanQvQ
//router.get('/all/:keyword', function(req, res) {
router.get('/all', function(req, res) {

    var keyword = req.params.keyword;
    //var token = req.params.token; //先不檢查
    var json = {
        msg: "沒有資料",
        err: ""
    }

    models.Member.findAll({

    }).then(function(data) {

        //if (keyword != "Q_QtaiwanQvQ") data = cool();
        //console.log(data);
        res.json(data);

    }).catch(function(err) {
        // handle error;
        console.log(err);
        json.err = "sql";
        //json.msg = err.message;
        res.json(json);
    });

    //res.send(cool());
    //console.log(cool());

});


module.exports = router;