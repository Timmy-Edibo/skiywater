import { Express } from "express";
import User from "../routes/routes.User";
import Auth from "../routes/routes.Auth";
import FileUpload from "../routes/routes.FileUpload";
import { createSuccessResponse } from "../config/config.responses";


export default function routing(app: Express) {
  app.use("/api/v1/users", User);
  app.use("/api/v1/auth", Auth);
  app.use("/api/v1/files", FileUpload);

  app.get("/", async (req, res) => {
    const data = {
      About: 'Skiywater backend task for file upload and management',
      Version: '1.0.0',
      API: 'https://bit.ly/skiywater-backend-tasks-docs',
      Backend: 'https://skiywater.onrender.com',
      EMR: 'https://lucid.app/lucidchart/823e7c53-bd02-4020-8215-91c91863ff3b/edit?viewport_loc=-808%2C93%2C2246%2C1044%2C0_0&invitationId=inv_9bbb677d-d6c3-469b-b4f2-832af69807fd',
      Github: 'https://github.com/Timmy-Edibo/skiywater'
    }
    res.status(200).json(createSuccessResponse(data))
  })
}
