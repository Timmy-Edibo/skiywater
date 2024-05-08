// user.repository.js

import User from '../models/model.User';
const mongoose = require('mongoose');
const id = new mongoose.Types.ObjectId();

class UserRepository {
  async createUser(userData: Object) {
    return User.create(userData);
  }

  async getUserById(userId: string) {
    return User.findById(userId);
  }

  async getUserByEmail(email: string) {
    return User.findOne({email: email});
  }

  async getUserByUsername(username: string) {
    return User.findOne({username: username});
  }

  async getAllUsers() {
    return User.find();
  }

  async updateUser(userId: string, newData: Object) {
    return User.findByIdAndUpdate(userId, newData, { new: true });
  }

  async deleteUser(userId: string) {
    return User.findByIdAndDelete(userId);
  }
}

export default new UserRepository();