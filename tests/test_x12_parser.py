from parsers.x12_837_parser import X12ClaimParser


VALID_837_SNIPPET = (
    "NM1*85*2*BILLING PROVIDER*****XX*1234567893~"
    "NM1*82*1*DOE*JANE****XX*9876543210~"
    "CLM*ABC123*150***11:B:1*Y*A*Y*I~"
    "SV1*HC:99213:25*100*UN*1***1~"
    "SV2*0300*HC:81099:26*50*UN*1~"
)


def test_validate_accepts_supported_837_text() -> None:
    parser = X12ClaimParser()

    result = parser.validate(VALID_837_SNIPPET)

    assert result.is_valid is True
    assert result.errors == []


def test_validate_rejects_text_without_required_delimiters() -> None:
    parser = X12ClaimParser()

    result = parser.validate("NM1 no delimiters present")

    assert result.is_valid is False
    assert "Missing X12 segment terminator '~'." in result.errors
    assert "Missing X12 data element separator '*'." in result.errors


def test_parse_extracts_normalized_claim_fields() -> None:
    parser = X12ClaimParser()

    claims = parser.parse(VALID_837_SNIPPET)

    assert len(claims) == 1
    claim = claims[0]
    assert claim.claim_id == "ABC123"
    assert claim.claim_segment["claim_amount"] == "150"
    assert claim.billing_provider.last_name_or_organization == "BILLING PROVIDER"
    assert claim.rendering_provider.first_name == "JANE"
    assert len(claim.service_lines) == 2
    assert claim.service_lines[0].service_code == "99213"
    assert claim.service_lines[0].modifiers == ["25"]
    assert claim.service_lines[0].claim_amount == "100"
    assert claim.service_lines[1].service_code == "81099"
    assert claim.service_lines[1].modifiers == ["26"]
    assert claim.service_lines[1].claim_amount == "50"
