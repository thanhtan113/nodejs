var express = require('express');
var router = express.Router();
var Nhasx = require('../models/nhasx');
var Sanpham = require('../models/sanpham');
router.get('/nhasxthem', function(req, res, next) {
    res.render('nhasx/nhasxthem', { errors: null });
});
router.post('/nhasxthem', function(req, res, next) {

    req.checkBody('tennhasx', 'Ten san pham khong duoc rong').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.render('nhasx/nhasxthem', { errors: errors });
    } else {
        var nhasx = new Nhasx({
            tennhasx: req.body.tennhasx
        });
        nhasx.save().then(function() {
            req.flash('success_msg', 'Đã Thêm Thành Công');
            console.log(nhasx);
            res.redirect('/nhasx/danhsachnhasx');
        });
    }
});
router.get('/danhsachnhasx', function(req, res, next) {


    Nhasx.aggregate([{ $lookup: { from: "sanphams", localField: "_id", foreignField: "nhasx", as: "docs" } }]).exec(function(err, nhasx) {

        let sanpham_nsx = [];

        for (let i = 0; i < nhasx.length; i++) {
            //mang.push(nhasx.slice(i));
            let data = {
                id: nhasx[i]._id,
                tennhasx: nhasx[i].tennhasx,
            }
            data.danhsachsp = nhasx[i].docs.map(function(e) {

                return e.ten
            });
        }
        sanpham_nsx.push(data);
    });
    res.render('nhasx/danhsachnhasx', { nhasx: sanpham_nsx });
    //db.getCollection('nhasxes').aggregate([{$lookup:{ from: "sanphams", localField: "_id", foreignField: "nhasx", as: "tong cong" }}])
});
router.get('/sanphamnhasx/:id', function(req, res, next) {
    Sanpham.find({ nhasx: req.params.id }).exec().then(function(sanpham) {
        res.render('nhasx/sanphamnhasx', { sanpham: sanpham });
    })
});

module.exports = router;