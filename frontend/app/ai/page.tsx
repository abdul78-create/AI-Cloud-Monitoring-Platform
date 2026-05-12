import { LogAnalyzerClient } from "@/ai/LogAnalyzerClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AIPage() {
  return (
    <ErrorBoundary>
      <LogAnalyzerClient />
    </ErrorBoundary>
  );
}
