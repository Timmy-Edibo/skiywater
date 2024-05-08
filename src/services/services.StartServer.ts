import express from "express";
import serverErrorHandling from "./services.ServerErrorHandling";
import logReqRes from "./services.Logging";
// import http from "http";
import { config } from "../config/config.mongodb";
import routing from "../constants/routes";
import cors from "cors";
import { app, server, io } from "../services/services.Socket"
import { authZero } from "./services.Auth0";

const StartServer = () => {
  app.use(authZero)
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  routing(app); // all routes contain here
  app.use(logReqRes); // logging
  app.use(serverErrorHandling); // error handling
  app.use(cors());
  app.set("io", io)
  app.use(express.urlencoded({extended: true}))

  server.listen(config.Server.port, () =>
    console.info(`Server is running on port ${config.Server.port}.`)
  );
};

export default StartServer;