var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');

// GET all roles (không bị xoá mềm)
router.get('/', async function (req, res, next) {
    let result = await roleModel.find({ isDeleted: false });
    res.send(result);
});

// GET role theo id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findOne({ isDeleted: false, _id: id });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// POST tạo role mới
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT cập nhật role theo id
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedRole = await roleModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedRole) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        res.send(updatedRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE xoá mềm role theo id
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let deletedRole = await roleModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deletedRole) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        res.send(deletedRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET tất cả users thuộc role này: GET /roles/:id/users
router.get('/:id/users', async function (req, res, next) {
    try {
        let id = req.params.id;
        // Kiểm tra role tồn tại
        let role = await roleModel.findOne({ isDeleted: false, _id: id });
        if (!role) {
            return res.status(404).send({ message: "Role ID NOT FOUND" });
        }
        let userModel = require('../schemas/users');
        let users = await userModel.find({ isDeleted: false, role: id }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
