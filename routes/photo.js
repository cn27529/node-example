var models = require('../models');
var express = require('express');
var router = express.Router();
var cool = require('cool-ascii-faces');

//文件
//https://cn27529.gitbooks.io/mycloudlife-api/content/photo.html

//create ok
router.post('/create', function(req, res) {
    //token檢查, 先不檢查
    //var token = req.body.token;
    var json = {};

    // create新相簿
    models.Photo.create({
        title: req.body.photo.title,
        body: req.body.photo.body,
        photoday: req.body.photo.photoday,
        ProfileId: req.body.id
    }).then(function(data) {
        // console.log(data.get({ plain: true }));

        // 存入相片
        var photo_images = req.body.photo_images || [];
        photo_images.forEach(function(item) {
            models.Photo_image.create({
                title: item.title,
                image: item.image,
                PhotoId: data.id,
                ProfileId: req.body.id
            })
        });

        json = {
            "id": data.id, //這是使用者的資料代碼, 可存在用戶端
            "msg": "ok,資料己建立",
            "err": ""
        };

        res.json(json);
    });
});

//update ok
router.post('/mod', function(req, res) {

    console.log('-------------photo/mod---------------------');

    var json = {
        id: 0,
        msg: "沒有資料可更新",
        err: "",
    }

    models.Photo.findOne({
        where: {
            ProfileId: req.body.id,
            id: req.body.photo.id
        }
    }).then(function(data) {
        if (data === null) {
            return res.json(json);
        }

        var photoId = data.id;
        json.id = photoId; //這是 photo id資料代碼, 可存在用戶端

        console.log(data.get({
            plain: true
        }));

        data.update({
            title: req.body.photo.title,
            body: req.body.photo.body,
        }).then(function(data) {
            // update photo_image
            var photo_images = req.body.photo_images || [];

            photo_images.forEach(function(item) {

                console.log('---------------forEach-------------------');

                models.Photo_image.findOne({
                    where: {
                        PhotoId: photoId,
                        id: item.id
                    }
                }).then(function(image) {
                    if (image === null) {
                        return
                    }

                    image.update({
                        title: item.title,
                        image: item.image
                    });

                }).catch((err) => {
                    console.log('err---------------models.Photo_image.findOne-------------------');
                });


                //這是新增的
                if (item.id == 0) {
                    models.Photo_image.create({
                        title: item.title,
                        image: item.image,
                        PhotoId: photoId,
                        ProfileId: req.body.id
                    })
                }


            });

            json.err = "";
            json.msg = "ok,資料己更新";

            res.json(json);

        })
    });

});


// get by id
router.get('/limit/:id/:limit', function(req, res) {

    var id = req.params.id;
    var limit = req.params.limit;
    //var token = req.params.token; //先不檢查

    var json = {
        id: 0,
        msg: "沒有資料",
        err: "",
        photos: []
    }

    // 撈photo的資料
    models.Photo.findAll({
        where: {
            ProfileId: id
        },
        limit: parseInt(limit),
        order: 'id DESC',
        include: [{
            model: models.Photo_image,
            order: 'id DESC'
            //limit: 1
        }],
        //include : [{model : models.Photo_image, limit 5}]
    }).then(function(photos) {

        json.id = id;
        json.msg = "ok";
        json.photos = photos;
        res.json(json);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    })

});


// http://yourdomain/photo/next/:id/:limit/:currentid
// :id 這是profile資料代碼
// :limit 是要取得幾筆給前端, 若10, 表示給前端10筆
// :currentid 提供目前最後一筆的note id, 會由目前的note id往下找:limit筆
router.get('/next/:id/:limit/:currentid', function(req, res) {

    var json = {
        id: 0,
        msg: "沒有查詢到資料",
        err: "",
        photos: []
    }
    var id = req.params.id;
    var limit = req.params.limit;
    var currentid = req.params.currentid;
    //var token = req.params.token; //先不檢查

    //$gt: 6,                // > 6
    //$gte: 6,               // >= 6
    //$lt: 10,               // < 10

    models.Photo.findAll({
        where: {
            ProfileId: id,
            id: {
                $lt: currentid
            }
        },
        limit: parseInt(limit),
        order: 'id DESC',
        include: [{
            model: models.Photo_image,
            order: 'id DESC'
            //limit: 1
        }],
    }).then(function(data) {

        //console.log(data);
        if (data.length > 0) {
            json.photos = data;
            json.msg = "ok";
        }
        json.id = id;
        res.json(json);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    })

});


// delete by photo id
router.get('/del/:id', function(req, res) {

    var id = req.params.id;

    var json = {
        id: id,
        msg: "沒有資料可刪除",
        err: ""
    }

    models.Photo.findAll({
        where: {
            id: id
        }
    }).then(function(data) {

        data.map(function(item) {
            json.msg = "ok,刪除";

            models.Photo.destroy({
                where: {
                    id: req.params.id
                }
            }).then(function(data) {
                json.msg = "ok,刪除";
                json.id = data.id;
                res.json(json);
            });

        })
        res.json(json);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    });


});

// delete by photo_image id
router.get('/delimage/:id', function(req, res) {

    var id = req.params.id;

    var json = {
        id: id,
        msg: "沒有資料可刪除",
        err: ""
    }

    models.Photo_image.findAll({
        where: {
            id: id
        }
    }).then(function(data) {

        data.map(function(item) {
            json.msg = "ok,刪除";

            models.Photo_image.destroy({
                where: {
                    id: req.params.id
                }
            }).then(function(data) {
                json.msg = "ok,刪除";
                json.id = data.id;
                res.json(json);
            });

        })
        res.json(json);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    });

})


//all的通關密語是Q_QtaiwanQvQ
//router.get('/all/:keyword', function(req, res) {
router.get('/all', function(req, res) {

    var keyword = req.params.keyword;
    //var token = req.params.token; //先不檢查

    var json = {
        msg: "沒有資料",
        err: ""
    }

    models.Photo.findAll({
        include: [{
            model: models.Photo_image,
            limit: 1
                //order: ['id', 'DESC']
        }],
    }).then(function(data) {

        //if (keyword != "Q_QtaiwanQvQ") data = cool();
        //if (data == null) data = cool();
        //json.photos = data;
        res.json(data);

    }).catch(function(err) {
        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);
    });

})


//取得相本的所有相片
router.get('/images/:id', function(req, res) {

    var photoid = req.params.id;
    //var token = req.params.token; //先不檢查
    var json = {
        id: photoid,
        msg: "沒有資料",
        err: "",
        Photo_image: []
    }

    models.Photo_image.findAll({
        where: {
            PhotoId: photoid
        }
    }).then(function(data) {

        //if (keyword != "Q_QtaiwanQvQ") data = cool();
        if (data == null) data = cool();
        json.Photo_image = data;
        json.msg = "ok";
        res.json(json);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    });

})


//取得相本的所有相片
router.get('/allimage', function(req, res) {

    //var photoid = req.params.id;
    //var token = req.params.token; //先不檢查
    var json = {
        id: 0,
        msg: "沒有資料",
        err: "",
        Photo_image: []
    }

    models.Photo_image.findAll({
        // where: {
        //     PhotoId: photoid
        // }
    }).then(function(data) {

        //if (keyword != "Q_QtaiwanQvQ") data = cool();
        if (data == null) data = cool();
        json.Photo_image = data;
        json.msg = "ok";

        //res.json(json);
        res.json(data);

    }).catch(function(err) {

        console.log(err);
        json.err = "sql";
        json.msg = err;
        res.json(json);

    });

})



module.exports = router;
