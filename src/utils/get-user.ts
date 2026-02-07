import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_KEY = process.env.NEXT_PUBLIC_JWT_SECRET! || "";

export const getUser = async (): Promise<any> => {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  const user = jwt.verify(token, JWT_KEY);

  if (!user) {
    return null;
  }

  return user;
};
