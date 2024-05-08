// import joi, { ObjectSchema } from "joi";
// import { NextFunction, Response, Request } from "express";
// import { IProgramBlock } from "../models/model.ProgramBlock";
// import { ISchedule } from "../models/model.Schedule";

// export const ValidateSchema = (Schema: ObjectSchema) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         await Schema.validateAsync(req.body);
//         next();
//       } catch (error) {
//         res.status(422).json({ error });
//       }
//     };
//   };
