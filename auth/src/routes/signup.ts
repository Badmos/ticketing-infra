import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { BadRequestError } from "@coboard/common";
import jwt from "jsonwebtoken";
import { validateRequest } from "@coboard/common";

const router = express.Router();

const sanitizeRequest = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20"),
];

const signupController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError("Email already exists");
  }
  const user = User.build({
    email,
    password,
  });

  await user.save();

  // Generate JWT
  const assignedUserJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  //Store it on session Object. Cookie-Session mandates a three flags on session
  //object from V2.0.40.
  // Keep checking github issue to update to latest version of @types/cookie-session
  req.session!.jwt = assignedUserJwt;

  res.status(201).json(user);
};

router.post("/api/users/signup", sanitizeRequest, validateRequest, signupController);

// router.post(
//   "/api/users/signup",
//   [
//     body("email").isEmail().withMessage("Email must be valid"),
//     body("password")
//       .trim()
//       .isLength({ min: 4, max: 20 })
//       .withMessage("Password must be between 4 and 20"),
//   ],
//   validateRequest,
//   async (req: Request, res: Response) => {

//     const { email, password } = req.body;
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       throw new BadRequestError("Email already exists");
//     }
//     const user = User.build({
//       email,
//       password,
//     });

//     await user.save();

//     // Generate JWT
//     const assignedUserJwt = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//       },
//       process.env.JWT_KEY!
//     );

//     //Store it on session Object. Cookie-Session mandates a three flags on session
//     //object from V2.0.40.
//     // Keep checking github issue to update to latest version of @types/cookie-session
//     req.session!.jwt = assignedUserJwt;

//     res.status(201).json(user);
//   }
// );

export { router as signupRouter };
