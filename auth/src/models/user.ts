import mongoose, { MongooseDocument } from "mongoose";
import { Password } from "../helpers/password";

// an interface that describes properties required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

//interface that describes properties that  exist on a User Document
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  const user = this;
  if (user.isModified("password")) {
    const hashedPassword = await Password.toHash(user.get("password"));
    user.set("password", hashedPassword);
  }

  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
