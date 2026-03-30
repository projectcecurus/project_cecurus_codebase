import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card title="Access denied" description="Your role does not have access to this workspace section. Contact your organization administrator if you need additional permissions.">
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button>Return to dashboard</Button>
          </Link>
          <Link href="/compliance">
            <Button variant="secondary">Review compliance area</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
