const Users = require("../models/user.model.js");

const addUser = async (req, res) => {
  try {
    const { fullName, email, contactNumber, password } = req.body;
    const newUser = new Users({ fullName, email, contactNumber, password });
    await newUser.save();
    res
      .status(201)
      .json({ status: "success", message: "User added successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId){
      return res.status(400).json ({ status: "error", message: "user id is required" });
    }
    const { fullName, email, contactNumber, password } = req.body;
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { fullName, email, contactNumber, password },
      { new: true },
    );
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // if (!userId){
    //   return res.status(400).json ({ status: "error", message: "user id is required" });
    // }
    await Users.findByIdAndDelete(userId);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: "error", message: "failed to delete user" });
  }
}

const getAllUser = async  (req, res) => {
  try {
    const user = await Users.find();
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "failed to fetch user" });
  }
}

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "failed to fetch user" });
  }
}

module.exports = { addUser, updateUser, deleteUser, getAllUser, getSingleUser };
