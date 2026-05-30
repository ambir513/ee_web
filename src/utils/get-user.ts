import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

interface UserPayload {
  _id: string;
  email: string;
  role: string;
}

export const getUser = async (): Promise<UserPayload | null> => {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
};
