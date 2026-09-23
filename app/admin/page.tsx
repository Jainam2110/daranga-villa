import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";

export default async function AdminRootPage() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  } else {
    redirect("/admin/dashboard");
  }
}
