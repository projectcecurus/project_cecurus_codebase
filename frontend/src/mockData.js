export const dashboardResponse = {
  metrics: {
    total_claims_processed: 24,
    total_flags_created: 7,
    flags_by_rule_type: {
      ExactClaimDuplicate: 2,
      DuplicateServiceLinesWithinClaim: 3,
      SameClaimContentDifferentIds: 2
    },
    flags_by_workflow_status: {
      New: 4,
      Reviewed: 1,
      Resolved: 1,
      Ignored: 1
    }
  },
  flags: [
    {
      flag_id: "EXACT-1",
      rule_type: "ExactClaimDuplicate",
      claim_ids: ["CLM1001", "CLM1001"],
      billing_provider: "BILLING GROUP||XX|1234567893",
      rendering_provider: "DOE|JANE|XX|9876543210",
      matched_identifiers: ["CLM", "NM1*85", "NM1*82", "SV1"],
      explanation: "Claims share the same claim_id, provider identities, and identical service lines.",
      status: "New"
    },
    {
      flag_id: "LINE-1",
      rule_type: "DuplicateServiceLinesWithinClaim",
      claim_ids: ["CLM2002"],
      billing_provider: "BILLING GROUP||XX|1234567893",
      rendering_provider: "DOE|JANE|XX|9876543210",
      matched_identifiers: ["CLM", "NM1*85", "NM1*82", "SV1", "SV2"],
      explanation: "Claim contains repeated service line content.",
      status: "Reviewed"
    }
  ]
};

export const flagDetails = {
  "EXACT-1": {
    flag: dashboardResponse.flags[0],
    claims: [
      {
        claim_id: "CLM1001",
        billing_provider: {
          last_name_or_organization: "Billing Group",
          first_name: "",
          id_code_qualifier: "XX",
          id_code: "1234567893"
        },
        rendering_provider: {
          last_name_or_organization: "Doe",
          first_name: "Jane",
          id_code_qualifier: "XX",
          id_code: "9876543210"
        },
        claim_segment: {
          raw: "CLM*CLM1001*275***11:B:1*Y*A*Y*I",
          claim_amount: "275"
        },
        service_lines: [
          {
            line_type: "SV1",
            raw: "SV1*HC:99213:25*100*UN*1***1",
            service_code: "99213",
            modifiers: ["25"],
            claim_amount: "100"
          }
        ]
      }
    ]
  }
};
