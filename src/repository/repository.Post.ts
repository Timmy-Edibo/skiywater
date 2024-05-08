import Post from "../models/model.Post";
import Follow from "../models/model.Follow";

class PostRepository {
  async createPost(postData: Object) {
    return Post.create(postData);
  }

  async getPostById(postId: string) {
    return Post.findById(postId);
  }

  async getAllPosts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return Post.find().skip(skip).limit(limit).exec();
  }

  // async getAllPostByUser(userId: string) {
  //   return Post.find({ author: userId });
  // }

  async getAllPostByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const posts = await Post.find({ author: userId })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async updatePost(postId: string, newData: Object) {
    return Post.findByIdAndUpdate(postId, newData, { new: true });
  }

  async deletePost(postId: string) {
    return Post.findByIdAndDelete(postId);
  }

  async getAllPostByFollowers(userId: string) {
    const follows = await this.getAllFollow(userId);

    // Extract unique authors' IDs from the follows
    const followedUsers = follows.map((follow) => follow.following);
    const posts = await Post.find({ author: { $in: followedUsers } });
    return posts;
  }

  private async getAllFollow(userId: string) {
    return Follow.find({ follower: userId });
  }
}

export default new PostRepository();
