const express = require("express");
const route = express.Router();
const {addUser, updateUser, deleteUser, getAllUser, getSingleUser} = require("../controllers/user.controller.js");

route.post('/add', addUser);
route.put('/update/:id', updateUser);
route.delete('/delete/:id', deleteUser);
route.get('/', getAllUser);
route.get('get/:id', getSingleUser);

module.exports = route;