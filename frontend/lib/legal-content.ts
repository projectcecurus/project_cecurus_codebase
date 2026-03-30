export const legalDocuments = {
  terms: {
    title: "Terms of Service",
    effectiveDate: "March 30, 2026",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: [
          "By accessing or using Project Cecurus, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.",
        ],
      },
      {
        heading: "Description of Services",
        body: [
          "Project Cecurus provides a healthcare claims integrity platform that analyzes standard healthcare claim files, including X12 837 transactions, to identify potential duplicate or overlapping claims before submission.",
          "The platform supports operational review and does not replace professional billing, coding, legal, or compliance judgment.",
        ],
      },
      {
        heading: "User Responsibilities",
        body: [
          "Users must use the platform lawfully, ensure they have rights to process submitted data, protect account credentials, and comply with applicable healthcare, privacy, and data protection laws.",
        ],
      },
      {
        heading: "Data Handling and Processing",
        body: [
          "Project Cecurus is designed as a zero-data-storage system.",
          "Uploaded claim files are processed temporarily in memory, the platform does not persist raw claim files or claim-level data, and only aggregated, non-identifiable metadata may be retained for reporting.",
        ],
      },
      {
        heading: "Advice Disclaimer and Liability",
        body: [
          "The platform provides analytical insights only and does not constitute medical, billing, coding, legal, or compliance advice.",
          "To the maximum extent permitted by law, Project Cecurus is not liable for claim denials, billing errors, compliance issues, or financial losses arising from use of the platform.",
        ],
      },
      {
        heading: "Termination and Updates",
        body: [
          "Access may be suspended or terminated for misuse, unauthorized activity, or violation of the terms.",
          "We may update these Terms from time to time, and continued use constitutes acceptance of the updated version.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    effectiveDate: "March 30, 2026",
    sections: [
      {
        heading: "Overview",
        body: [
          "Project Cecurus is designed with a privacy-first, zero-data-storage architecture that minimizes collection, storage, and exposure of sensitive information.",
        ],
      },
      {
        heading: "Information We Collect",
        body: [
          "We collect organization and account information such as personnel names, role assignments, email addresses, organization identifiers, and non-PHI usage data like login activity and aggregate system metrics.",
        ],
      },
      {
        heading: "Claims Data Handling",
        body: [
          "Project Cecurus does not store claims data. Uploaded EDI 837 files are processed in memory only, claim-level data is not persisted to databases, and data is discarded immediately after processing.",
          "We do not retain patient identifiers, claim-level details, or service-line data.",
        ],
      },
      {
        heading: "Aggregate Data and Retention",
        body: [
          "We may retain non-identifiable aggregate data such as the number of claims processed, duplicate flags detected, severity counts, and estimated financial exposure totals.",
          "Account data is retained only as needed for service operation; claim data is not retained.",
        ],
      },
      {
        heading: "Security and User Rights",
        body: [
          "We use encryption in transit, secure authentication, access controls, and non-PHI audit logging.",
          "Depending on jurisdiction, users may access, correct, or request deletion of account information.",
        ],
      },
    ],
  },
  security: {
    title: "Security & Compliance Overview",
    effectiveDate: "March 30, 2026",
    sections: [
      {
        heading: "Security Philosophy",
        body: [
          "Project Cecurus is built on a privacy-first, zero-data-storage architecture. Sensitive claim data is processed, not stored.",
        ],
      },
      {
        heading: "Zero-Data-Storage Design",
        body: [
          "The platform does not store raw EDI 837 files, parsed claim data, patient identifiers, or claim-level data in cloud systems.",
          "All claim processing occurs in memory within a controlled processing environment, with immediate disposal after execution.",
        ],
      },
      {
        heading: "Access Controls and Logging",
        body: [
          "Project Cecurus uses role-based access control, secure authentication, and organization-level data isolation.",
          "Audit logs record safe operational events such as sign-ins, file processing events, review actions, and administrative changes without PHI or claim-level detail.",
        ],
      },
      {
        heading: "Encryption and PHI Handling",
        body: [
          "The platform uses HTTPS/TLS for communications and secure token handling for authentication.",
          "PHI is not stored, transmitted to external systems, or retained in logs or analytics.",
        ],
      },
      {
        heading: "Compliance Positioning",
        body: [
          "Project Cecurus is designed to support organizations in improving claims integrity, reducing administrative waste, and strengthening internal controls.",
          "Customers remain responsible for their own regulatory compliance obligations, including HIPAA.",
        ],
      },
    ],
  },
} as const;
