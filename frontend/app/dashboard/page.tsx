import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardRedesign from "@/dashboard/DashboardRedesign";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return <DashboardRedesign />;
}
