import { User } from "@/app/dal/schema/User";
import { AuthService } from "@/app/dal/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const createdUser = User.pick({
      username: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
    }).parse(body);

    const detailedUser = await AuthService.insertUser(createdUser);
    return new Response(JSON.stringify(detailedUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Cannot create new user", { status: 400 });
  }
}
