"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProtectedPage } from "@/components/app/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

export default function RunReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function validateFile() {
    if (!selectedFile) {
      setError("Select an 837 file first.");
      return;
    }
    setError("");
    const response = await api.validateFile(selectedFile);
    setValidationMessage(response.is_valid ? "File structure is valid for session processing." : response.errors.join(" "));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Select an 837 file first.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const session = await api.processFile(selectedFile);
      window.sessionStorage.setItem("cecurus:last-review-session", session.metadata.session_id);
      router.push(`/review-session?session=${session.metadata.session_id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to process file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <ProtectedPage roles={["Admin", "Reviewer", "Analyst", "HospitalStaff"]}>
      <div className="space-y-6">
        <PageHeader
          title="Run a temporary review"
          subtitle="Uploaded files are processed only for the active session. Claim-level data is not persisted after session expiry or manual discard."
        />
        {searchParams.get("ended") === "1" ? (
          <Card className="border-brand-200 bg-brand-50/70 dark:border-brand-400/20 dark:bg-brand-500/10">
            <p className="text-sm text-brand-800 dark:text-brand-200">The prior review session was discarded from memory.</p>
          </Card>
        ) : null}
        <Card title="Session processing" description="Use this workspace to validate and review a file without creating long-term claim storage.">
          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Upload 837 file</span>
              <input type="file" accept=".837,.x12,.txt" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            </label>
            <div className="rounded-[1.5rem] bg-brand-50/80 p-4 text-sm leading-6 text-brand-900 dark:bg-brand-500/10 dark:text-brand-200">
              Files are processed in-session only. The backend stores aggregate metrics and audit-safe events, not raw files or parsed claim payloads.
            </div>
            {validationMessage ? <p className="text-sm text-brand-700 dark:text-brand-300">{validationMessage}</p> : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => validateFile()}>
                Validate file
              </Button>
              <Button disabled={processing}>{processing ? "Processing..." : "Process in session"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </ProtectedPage>
  );
}
