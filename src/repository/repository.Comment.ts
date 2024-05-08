import Comment from '../models/model.Comment'; // Assuming you have a model for comments

class CommentRepository {
  getAllComments() {
    return Comment.find();
  }

  async createComment(commentData: Object) {
    return Comment.create(commentData);
  }

  async getCommentById(commentId: string) {
    return Comment.findById(commentId);
  }

  async getCommentsByUserId(userId: string) {
    return Comment.find({ user_id: userId });
  }

  async getCommentsByPostId(postId: string) {
    return Comment.find({ post_id: postId });
  }

  async updateComment(commentId: string, newData: Object) {
    return Comment.findByIdAndUpdate(commentId, newData, { new: true });
  }

  async deleteComment(commentId: string) {
    return Comment.findByIdAndDelete(commentId);
  }

  async deleteCommentsByUserId(userId: string) {
    return Comment.deleteMany({ user_id: userId });
  }

  async deleteCommentsByPostId(postId: string) {
    return Comment.deleteMany({ post_id: postId });
  }
}

export default new CommentRepository();
