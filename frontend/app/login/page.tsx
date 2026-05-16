import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14]" />}>
      <LoginClient />
    </Suspense>
  );
}
