import Link from "next/link";
import { notFound } from "next/navigation";

import { legalDocuments } from "@/lib/legal-content";
import { Card } from "@/components/ui/card";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function LegalDocumentPage({ params }: Params) {
  const { slug } = await params;
  const document = legalDocuments[slug as keyof typeof legalDocuments];

  if (!document) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ink-100 px-4 py-10 dark:bg-ink-950 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-500 dark:text-ink-300">
          <Link href="/" className="font-medium text-brand-700 hover:text-brand-500 dark:text-brand-300">
            Project Cecurus
          </Link>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/security">Security</Link>
          </div>
        </div>
        <Card title={document.title} description={`Effective date: ${document.effectiveDate}`}>
          <div className="space-y-8">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-ink-950 dark:text-white">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>
        <footer className="mt-6 flex flex-wrap gap-4 text-sm text-ink-500 dark:text-ink-300">
          <Link href="/login">Login</Link>
          <Link href="/onboarding">Register Organization</Link>
        </footer>
      </div>
    </main>
  );
}
