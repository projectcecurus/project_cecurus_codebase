from __future__ import annotations

from collections import Counter, defaultdict

from backend.schemas.claims import ClaimRecord, ServiceLine
from backend.schemas.detection import DetectionFlag, FlagStatus, RuleType
from backend.services.flag_repository import FlagRepository


class DetectionService:
    def __init__(self, repository: FlagRepository | None = None) -> None:
        self.repository = repository or FlagRepository()

    def run_detection(self, claims: list[ClaimRecord]) -> list[DetectionFlag]:
        flags: list[DetectionFlag] = []
        flags.extend(self._detect_exact_claim_duplicates(claims))
        flags.extend(self._detect_duplicate_service_lines_within_claim(claims))
        flags.extend(self._detect_same_content_different_ids(claims))
        self.repository.replace_flags(flags)
        return flags

    def list_flags(self) -> list[DetectionFlag]:
        return self.repository.list_flags()

    def get_flag(self, flag_id: str) -> DetectionFlag | None:
        return self.repository.get_flag(flag_id)

    def update_flag_status(self, flag_id: str, status: FlagStatus) -> DetectionFlag | None:
        return self.repository.update_status(flag_id, status)

    def _detect_exact_claim_duplicates(self, claims: list[ClaimRecord]) -> list[DetectionFlag]:
        grouped: dict[tuple[str, str, str, tuple[str, ...]], list[ClaimRecord]] = defaultdict(list)
        for claim in claims:
            key = (
                claim.claim_id,
                claim.billing_provider.normalized_identity(),
                claim.rendering_provider.normalized_identity(),
                tuple(line.normalized_signature() for line in claim.service_lines),
            )
            grouped[key].append(claim)

        flags: list[DetectionFlag] = []
        for index, duplicate_group in enumerate(grouped.values(), start=1):
            if len(duplicate_group) < 2:
                continue
            sample = duplicate_group[0]
            flags.append(
                DetectionFlag(
                    flag_id=f"EXACT-{index}",
                    rule_type=RuleType.EXACT_CLAIM_DUPLICATE,
                    claim_ids=[claim.claim_id for claim in duplicate_group],
                    billing_provider=sample.billing_provider.normalized_identity(),
                    rendering_provider=sample.rendering_provider.normalized_identity(),
                    matched_identifiers=self._matched_identifiers(sample),
                    explanation="Claims share the same claim_id, provider identities, and identical service lines.",
                )
            )
        return flags

    def _detect_duplicate_service_lines_within_claim(self, claims: list[ClaimRecord]) -> list[DetectionFlag]:
        flags: list[DetectionFlag] = []
        index = 1
        for claim in claims:
            counts = Counter(line.normalized_signature() for line in claim.service_lines)
            duplicates = [signature for signature, count in counts.items() if count > 1]
            if not duplicates:
                continue
            flags.append(
                DetectionFlag(
                    flag_id=f"LINE-{index}",
                    rule_type=RuleType.DUPLICATE_SERVICE_LINE_WITHIN_CLAIM,
                    claim_ids=[claim.claim_id],
                    billing_provider=claim.billing_provider.normalized_identity(),
                    rendering_provider=claim.rendering_provider.normalized_identity(),
                    matched_identifiers=self._matched_identifiers(claim),
                    explanation=(
                        "Claim contains repeated service line content: "
                        + "; ".join(duplicates)
                    ),
                )
            )
            index += 1
        return flags

    def _detect_same_content_different_ids(self, claims: list[ClaimRecord]) -> list[DetectionFlag]:
        grouped: dict[tuple[str, str, tuple[str, ...]], list[ClaimRecord]] = defaultdict(list)
        for claim in claims:
            key = (
                claim.billing_provider.normalized_identity(),
                claim.rendering_provider.normalized_identity(),
                tuple(sorted(self._service_line_content_signature(line) for line in claim.service_lines)),
            )
            grouped[key].append(claim)

        flags: list[DetectionFlag] = []
        index = 1
        for key, grouped_claims in grouped.items():
            unique_ids = {claim.claim_id for claim in grouped_claims}
            if len(grouped_claims) < 2 or len(unique_ids) < 2:
                continue
            flags.append(
                DetectionFlag(
                    flag_id=f"CONTENT-{index}",
                    rule_type=RuleType.SAME_CONTENT_DIFFERENT_ID,
                    claim_ids=sorted(unique_ids),
                    billing_provider=key[0],
                    rendering_provider=key[1],
                    matched_identifiers=self._matched_identifiers(grouped_claims[0]),
                    explanation="Claims have matching provider identities and service line content but different claim_id values.",
                )
            )
            index += 1
        return flags

    def _service_line_content_signature(self, service_line: ServiceLine) -> str:
        return "|".join(
            [
                service_line.line_type.strip().upper(),
                service_line.service_code.strip().upper(),
                ",".join(modifier.strip().upper() for modifier in service_line.modifiers),
                service_line.claim_amount.strip(),
            ]
        )

    def _matched_identifiers(self, claim: ClaimRecord) -> list[str]:
        identifiers = ["CLM", "NM1*85"]
        if claim.rendering_provider.normalized_identity().strip("|"):
            identifiers.append("NM1*82")
        line_types = {line.line_type for line in claim.service_lines}
        if "SV1" in line_types:
            identifiers.append("SV1")
        if "SV2" in line_types:
            identifiers.append("SV2")
        return identifiers
