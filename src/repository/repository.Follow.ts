import Follow from '../models/model.Follow'; // Assuming you have a model for follows

class FollowRepository {
  getAllFollow() {
    return Follow.find();
  }
  async createFollow(followData: Object) {
    return Follow.create(followData);
  }

  async checkFollowExist(followerId: string, followingId: string) {
    return Follow.findOne({ follower: followerId, following: followingId });
  }

  async getFollowById(followId: string) {
    return Follow.findById(followId);
  }

  async getFollowsByFollowerId(followerId: string) {
    return Follow.find({ follower_id: followerId });
  }

  async getFollowsByUserId(userId: string) {
    return Follow.find({ $or: [{ follower_id: userId }, { following_id: userId }] });
  }

  async getFollowsByFollowingId(followingId: string) {
    return Follow.find({ following_id: followingId });
  }

  async updateFollow(followId: string, newData: Object) {
    return Follow.findByIdAndUpdate(followId, newData, { new: true });
  }

  async deleteFollow(followId: string) {
    return Follow.findByIdAndDelete(followId);
  }

  async deleteFollowsByUserId(userId: string) {
    return Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] });
  }

}

export default new FollowRepository();
