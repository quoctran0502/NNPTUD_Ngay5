var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET tất cả users (không bị xoá mềm)
router.get('/', async function (req, res, next) {
    let result = await userModel.find({ isDeleted: false }).populate('role');
    res.send(result);
});

// GET user theo id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({ isDeleted: false, _id: id }).populate('role');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// POST tạo user mới
router.post('/', async function (req, res, next) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            status: req.body.status,
            role: req.body.role,
            loginCount: req.body.loginCount
        });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT cập nhật user theo id
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        res.send(updatedUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE xoá mềm user theo id
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let deletedUser = await userModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deletedUser) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        res.send(deletedUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /enable - kích hoạt user (status = true)
// Body: { email, username }
router.post('/enable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        let user = await userModel.findOne({ isDeleted: false, email: email, username: username });
        if (!user) {
            return res.status(404).send({ message: "Thông tin email hoặc username không đúng" });
        }
        user.status = true;
        await user.save();
        res.send({ message: "Kích hoạt tài khoản thành công", user });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /disable - vô hiệu hoá user (status = false)
// Body: { email, username }
router.post('/disable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        let user = await userModel.findOne({ isDeleted: false, email: email, username: username });
        if (!user) {
            return res.status(404).send({ message: "Thông tin email hoặc username không đúng" });
        }
        user.status = false;
        await user.save();
        res.send({ message: "Vô hiệu hoá tài khoản thành công", user });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
