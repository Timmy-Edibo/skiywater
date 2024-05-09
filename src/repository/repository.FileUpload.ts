import FileUpload from "../models/model.FileUpload";

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

  async getFileByUrl(fileUrl:string){
    return FileUpload.findOne({url: fileUrl})
  }

  async searchFile(searchCriteria: string) {
    const query = {
      $or: [
        { field: searchCriteria },
        { _id: searchCriteria },
        { filename: searchCriteria }
      ]
    };

    return FileUpload.find(query);
  }

}

export default new FileUploadRepository();
