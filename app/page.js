import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  // 1. If not logged in, send them to the login page
  if (!session) {
    redirect("/login");
  }

  // 2. Redirect based on the role we saved in the session callback
  const role = session.user.role;

  if (role === "admin") {
    redirect("/admin");
  } else if (role === "manager") {
    redirect("/manager");
  } else {
    redirect("/employee");
  }
}