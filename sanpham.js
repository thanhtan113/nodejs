var express = require('express');
var router = express.Router();
var Sanpham = require('../models/sanpham');
var Nhasx = require('../models/nhasx');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/upload')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

var upload = multer({ storage: storage });
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
//danh sach san pham
router.get('/danhsach', function(req, res, db) {
    Sanpham.find({}).populate('nhasx', 'tennhasx', Nhasx).exec(function(err, sanpham) {
        if (err) return console.log(err)
        res.render('sanpham/danhsach', { sanpham: sanpham });
        console.log(sanpham);
    })

});
//Them san pham
router.get('/sanphamthem', function(req, res, next) {
    Nhasx.find().then(function(nhasx) {
        res.render('sanpham/sanphamthem', { nhasx: nhasx, errors: null });

    });
});
//them san pham
router.post('/sanphamthem', upload.single('hinhanh'), function(req, res) {
    req.checkBody('ten', 'Ten san pham khong duoc rong').notEmpty();
    req.checkBody('chitiet', 'chi tiet san pham khong duoc rong').notEmpty();
    req.checkBody('gia', 'gia san pham khong duoc rong').notEmpty();
    var errors = req.validationErrors();
    if (errors) {

        Nhasx.find().then(function(nhasx) {
            res.render('sanpham/sanphamthem', { nhasx: nhasx, errors: errors });
        });

    } else {
        var sanpham = new Sanpham({
            ten: req.body.ten,
            hinhanh: req.file.filename,
            chitiet: req.body.chitiet,
            gia: req.body.gia,
            nhasx: req.body.nhasx
        });

        sanpham.save().then(function() {
            res.redirect('/sanpham/danhsach');
        })
    }


});
//Sua San pham
router.get('/sua-sanpham/:id', function(req, res, next) {
    /*  Sanpham.findById(req.params.id).then(function(sanpham) {

            res.render('sanpham/sua-sanpham', { errors: null, sanpham: sanpham });

        });
    */
    Sanpham.findById(req.params.id).then(function(sanpham) {
        var errors = req.flash('error');
        Nhasx.find().then(function(nhasx) {
            console.log(nhasx);
            res.render('sanpham/sua-sanpham', { nhasx: nhasx, sanpham: sanpham });
        });

    });
});
router.post('/sua-sanpham/:id', upload.single('hinhanh'), function(req, res, next) {
    Sanpham.findOne({ _id: req.params.id }, function(err, sanpham) {
        if (typeof(req.file) == 'undefined') {

            sanpham.ten = req.body.ten;
            sanpham.chitiet = req.body.chitiet;
            sanpham.gia = req.body.gia;
            sanpham.nhasx = req.body.nhasx;
            sanpham.save();
            res.redirect('/sanpham/danhsach');
        } else {
            var file = './public/upload/' + sanpham.hinhanh;
            var fs = require('fs');
            fs.unlink(file, function(e) {
                if (e) throw e;
            });
            sanpham.ten = req.body.ten;
            sanpham.hinhanh = req.file.filename;
            sanpham.chitiet = req.body.chitiet;
            sanpham.gia = req.body.gia;
            sanpham.nhasx = req.body.nhasx;
            sanpham.save();

            res.redirect('/sanpham/danhsach');
        }

    });


});



router.get('/xoa-sanpham/:id', function(req, res) {
    // Sanpham.findById(req.params.id).remove(function() {
    // 	console.log(daa);
    // 	req.flash('success_msg', 'Đã Xoá Thành Công');
    // 	res.redirect('/admin/Sanpham/danh-sach.html');
    // });

    Sanpham.findById(req.params.id, function(err, sp) {

        var fs = require('fs');
        fs.unlinkSync(('./public/upload/' + sp.hinhanh), function(e) {
            if (e) throw e;
        });
        sp.remove(function() {

            res.redirect('/sanpham/danhsach');
        })
    });

});


/*
    Nhasx.aggregate([{ $lookup: { from: "sanphams", localField: "_id", foreignField: "nhasx", as: "docs" } }]).exec(function(err, nhasx) {
        let sanpham_nsx = [];
        for (let i = 0; i < nhasx.length; i++) {
            //mang.push(nhasx.slice(i));
            let data = nhasx[i].docs.map(e => {
                return {
                    tennhasx: nhasx[i].tennhasx,
                    ten: e.ten
                }
            });
            sanpham_nsx.push(data);
        }
        console.log(sanpham_nsx);
        res.render('nhasx/danhsachnhasx', { nhasx: sanpham_nsx, length: nhasx.length });
*/
module.exports = router;