import { Express } from "express";
import User from "../routes/routes.User";
import Auth from "../routes/routes.Auth";
import FileUpload from "../routes/routes.FileUpload";
import { RequestContext } from "express-openid-connect";


export default function routing(app: Express) {
  app.use("/api/v1/users", User);
  app.use("/api/v1/auth", Auth);
  app.use("/api/v1/files", FileUpload);

  // app.get("/", async(req, res) => {
  //   const oidc = await req.oidc
  //   const userInfo = oidc.user
  //   const isAuthenticated = oidc.isAuthenticated() ? "logged in": "logged out"
  //   console.log(isAuthenticated)
  //   res.json({user: userInfo})

  // })
}
