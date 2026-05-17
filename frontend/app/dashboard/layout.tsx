import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
