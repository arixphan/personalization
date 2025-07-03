import { DBConnection } from "@/app/database/setup";
import { User } from "../schema/User";
import { v4 as uuidv4 } from "uuid";

type NewUser = Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt">;

class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export class AuthService {
  static async insertUser(user: NewUser) {
    if (!DBConnection.db) {
      throw new AuthServiceError("Database connection is not established");
    }

    const { email } = user;
    const existingUser = await DBConnection.db
      .collection("users")
      .findOne({ email });

    if (existingUser) {
      throw new AuthServiceError(`Email "${email}" already exists`);
    }

    try {
      const userWithId = User.parse({
        ...user,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      await DBConnection.db.collection("users").insertOne(userWithId);
      return userWithId;
    } catch (error) {
      console.error("Error inserting user:", error);
      throw new AuthServiceError("Failed to insert user");
    }
  }
}
