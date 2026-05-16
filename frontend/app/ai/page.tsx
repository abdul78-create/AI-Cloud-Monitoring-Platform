import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogAnalyzerClient } from "@/ai/LogAnalyzerClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function AIPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <ErrorBoundary>
      <LogAnalyzerClient />
    </ErrorBoundary>
  );
}
