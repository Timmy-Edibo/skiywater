// repository/LikeRepository.ts
import Like, { ILike } from '../models/model.Like';
import Post, { IPost } from '../models/model.Post';

class LikeRepository {
  async createLike(userId: string, postId: string): Promise<ILike> {
    const like = new Like({ user: userId, post: postId });

    // Increment the like count of the post
    const post = await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    console.log('this post..........', post);
    return like.save();
  }

  async checkLikeExist(userId: string, postId: string): Promise<ILike | null> {
    return Like.findOne({ user: userId, post: postId });
  }

  async findAllPostLikes( postId: string): Promise<ILike[] | null> {
    return Like.find({post: postId });
  }

  async deleteLike(userId: string, postId: string): Promise<void> {
    await Like.findOneAndDelete({ user: userId, post: postId });

    // Decrement the like count of the post
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
  }

}

export default new LikeRepository();
