import  FileUpload from "../models/model.FileUpload";
import Follow from "../models/model.Follow";

class FileUploadRepository {
  async uploadFile(fileUploadData: Object) {
    return FileUpload.create(fileUploadData);
  }

  async getFileById(fileId: string) {
    return FileUpload.findById(fileId);
  }

  async getAllFiles(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return FileUpload.find().skip(skip).limit(limit).exec();
  }

  // async getAllPostByUser(userId: string) {
  //   return FileUpload.find({ author: userId });
  // }

  async getAllFilesByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const posts = await FileUpload.find({ author: userId })
      .skip(skip)
      .limit(limit)
      .exec();
    return posts;
  }

  async updateFile(fileId: string, newData: Object) {
    return FileUpload.findByIdAndUpdate(fileId, newData, { new: true });
  }

  async deleteFile(fileId: string) {
    return FileUpload.findByIdAndDelete(fileId);
  }

  async getAllPostByFollowers(userId: string) {
    const follows = await this.getAllFollow(userId);

    // Extract unique authors' IDs from the follows
    const followedUsers = follows.map((follow) => follow.following);
    const posts = await FileUpload.find({ author: { $in: followedUsers } });
    return posts;
  }

  private async getAllFollow(userId: string) {
    return Follow.find({ follower: userId });
  }
}

export default new FileUploadRepository();
