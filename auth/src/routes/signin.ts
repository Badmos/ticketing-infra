import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateRequest } from "@coboard/common";
import { User } from "../models/user";
import { BadRequestError } from "@coboard/common";
import { Password } from "../helpers/password";

const router = express.Router();

const sanitizeRequest = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").trim().notEmpty().withMessage("you must supply a password"),
];

const signinController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const exisitingUser = await User.findOne({ email });

  if (!exisitingUser) {
    throw new BadRequestError("Invalid Email");
  }

  const isValidPassword = await Password.compare(exisitingUser.password, password);

  if (!isValidPassword) {
    throw new BadRequestError("Incorrect Password");
  }

  const assignedUserJwt = jwt.sign(
    {
      id: exisitingUser.id,
      email: exisitingUser.email,
    },
    process.env.JWT_KEY!
  );

  req.session!.jwt = assignedUserJwt;

  return res.status(200).json(exisitingUser);
};

router.post("/api/users/signin", sanitizeRequest, validateRequest, signinController);

export { router as signinRouter };

// router.post(
// 	"/api/users/signin",
// 	[
// 	  body("email").isEmail().withMessage("Email must be valid"),
// 	  body("password")
// 		.trim()
// 		.notEmpty()
// 		.withMessage("you must supply a password"),
// 	],
// 	(req: Request, res: Response) => {
// 	  const errors = validationResult(req);

// 	  if (!errors.isEmpty()) {
// 		throw new RequestValidationError(errors.array());
// 	  }
// 	}
//   );
