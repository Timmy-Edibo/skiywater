import { Express } from "express";
import User from "../routes/routes.User";
import Auth from "../routes/routes.Auth";
import Post from "../routes/routes.Post";
import Follow from "../routes/routes.Follow";
import Comment from "../routes/routes.Comment";
import Like from "../routes/routes.Like";
import FileUpload from "../routes/routes.FileUpload";
import { RequestContext } from "express-openid-connect";


export default function routing(app: Express) {
  app.use("/api/v1/users", User);
  app.use("/api/v1/auth", Auth);
  app.use("/api/v1/posts", Post);
  app.use("/api/v1/follow", Follow);
  app.use("/api/v1/comment", Comment);
  app.use("/api/v1/like", Like);
  app.use("/api/v1/files", FileUpload);
  // app.use("/", (req, res, next)=>{
  // res.send({"hello": "world"})
  // res.render("index", {title: "hellow worold"})
  // })
  app.get("/", async(req, res) => {
    const oidc = await req.oidc
    const userInfo = oidc.user
    const isAuthenticated = oidc.isAuthenticated() ? "logged in": "logged out"
    console.log(isAuthenticated)

  })

}
