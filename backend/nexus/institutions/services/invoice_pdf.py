"""Professional invoice PDF rendering for the Nexus platform.

Renders a polished A4 invoice (reportlab platypus) styled to match the
platform's frontend design language: Plus Jakarta Sans typography, the
Nexus logo, restrained brand-green accents and light table styling.
"""

from datetime import date
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ASSETS = Path(__file__).resolve().parent / "assets"

_BRAND = colors.HexColor("#146B4A")
_INK = colors.HexColor("#1F2933")
_MUTED = colors.HexColor("#6B7280")
_BORDER = colors.HexColor("#E6EBE8")
_LIGHT = colors.HexColor("#F8FAF9")
_ROW = colors.HexColor("#F5F8F6")
_WHITE = colors.white

for _w, _name in (("400", "PJS400"), ("500", "PJS500"), ("600", "PJS600"), ("700", "PJS700"), ("800", "PJS800")):
    pdfmetrics.registerFont(TTFont(_name, str(ASSETS / f"PlusJakartaSans-{_w}.ttf")))

_LOGO_PATH = ASSETS / "logo.png"


def _style(name, **kw):
    defaults = {
        "fontName": "PJS400",
        "fontSize": 9,
        "leading": 12,
        "textColor": _INK,
    }
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)


ST_COMPANY = _style("Company", fontName="PJS700", fontSize=11, leading=14)
ST_TAGLINE = _style("Tagline", fontSize=8, leading=10.5, textColor=_MUTED)
ST_INVOICE_LABEL = _style("InvoiceLabel", fontName="PJS800", fontSize=13, leading=16, alignment=TA_RIGHT)
ST_SECTION = _style("Section", fontName="PJS800", fontSize=8.5, leading=11)
ST_LABEL = _style("Label", fontName="PJS700", fontSize=6.8, leading=9, textColor=_MUTED)
ST_VALUE = _style("Value", fontName="PJS700", fontSize=9.5, leading=12.5)
ST_BODY = _style("Body", fontSize=9, leading=12.5)
ST_BODY_BOLD = _style("BodyBold", fontName="PJS700", fontSize=9, leading=12.5)
ST_CELL = _style("Cell", fontSize=8.8, leading=11.5)
ST_CELL_BOLD = _style("CellBold", fontName="PJS700", fontSize=8.8, leading=11.5)
ST_CELL_RIGHT = _style("CellRight", fontSize=8.8, leading=11.5, alignment=TA_RIGHT)
ST_CELL_CENTER = _style("CellCenter", fontSize=8.8, leading=11.5, alignment=TA_CENTER)
ST_HEAD = _style("Head", fontName="PJS700", fontSize=8, leading=10.5, textColor=_INK)
ST_MUTED = _style("Muted", fontSize=8, leading=11, textColor=_MUTED)
ST_TOTAL = _style("Total", fontName="PJS800", fontSize=11, leading=14, textColor=_WHITE, alignment=TA_RIGHT)
ST_TOTAL_LABEL = _style("TotalLabel", fontName="PJS700", fontSize=10, leading=14, textColor=_WHITE)
ST_FOOTER = _style("Footer", fontSize=7.5, leading=10, textColor=_MUTED, alignment=TA_CENTER)


def _money(value) -> str:
    try:
        return f"NGN {float(value):,.2f}"
    except (TypeError, ValueError):
        return "NGN 0.00"


def _date(value):
    if not value:
        return "—"
    return value.strftime("%d %b %Y")


def _status_colors(status):
    palette = {
        "PAID": (colors.HexColor("#166534"), colors.HexColor("#DCFCE7")),
        "PAYMENT_SUBMITTED": (colors.HexColor("#1E40AF"), colors.HexColor("#DBEAFE")),
        "UNPAID": (colors.HexColor("#92400E"), colors.HexColor("#FEF3C7")),
        "REJECTED": (colors.HexColor("#991B1B"), colors.HexColor("#FEE2E2")),
        "VOID": (colors.HexColor("#4B5563"), colors.HexColor("#F3F4F6")),
    }
    return palette.get(status, (colors.HexColor("#4B5563"), colors.HexColor("#F3F4F6")))


def _section(title: str) -> Table:
    """Section heading with a slim brand-green accent bar (restrained green)."""
    t = Table(
        [[Paragraph(title, ST_SECTION)]],
        colWidths=[162 * mm],
        style=TableStyle(
            [
                ("LINEBEFORE", (0, 0), (0, 0), 2.5, _BRAND),
                ("LEFTPADDING", (0, 0), (0, 0), 8),
                ("TOPPADDING", (0, 0), (0, 0), 0),
                ("BOTTOMPADDING", (0, 0), (0, 0), 0),
            ]
        ),
    )
    return t


def _box(rows, widths, header_bg=None):
    """Light bordered table with alternating rows (frontend table style)."""
    style = [
        ("BOX", (0, 0), (-1, -1), 0.6, _BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, _BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    if header_bg:
        style.append(("BACKGROUND", (0, 0), (-1, 0), header_bg))
        style.append(("ROWBACKGROUNDS", (0, 1), (-1, -1), [_WHITE, _ROW]))
    return Table(rows, colWidths=widths, style=TableStyle(style))


def build_invoice_pdf(invoice) -> bytes:
    """Render an :class:`InstitutionInvoice` into a professional PDF and return bytes."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=11 * mm,
        bottomMargin=15 * mm,
        title=f"Invoice {invoice.invoice_number}",
        author="Nexus Edutech Consult Ltd",
    )
    story = []

    # ---------- Header: logo + official invoice label ----------
    logo = Image(str(_LOGO_PATH), width=38 * mm, height=38 * mm * (400 / 1430))
    left_block = Table(
        [[logo], [Spacer(1, 2 * mm)], [Paragraph("Nexus Edutech Consult Ltd", ST_COMPANY)]],
        colWidths=[95 * mm],
        style=TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0)]),
    )

    status_fg, status_bg = _status_colors(invoice.status)
    status_badge = Table(
        [[Paragraph(invoice.get_status_display().upper(), _style("Status", fontName="PJS700", fontSize=7, leading=9, textColor=status_fg))]],
        colWidths=[62 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), status_bg),
                ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("BOX", (0, 0), (-1, -1), 0.5, status_bg),
            ]
        ),
    )
    right_block = Table(
        [[Paragraph("OFFICIAL INVOICE", ST_INVOICE_LABEL)], [Spacer(1, 3 * mm)], [status_badge]],
        colWidths=[67 * mm],
        style=TableStyle(
            [("ALIGN", (0, 0), (-1, -1), "RIGHT"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]
        ),
    )

    header = Table(
        [[left_block, right_block]],
        colWidths=[95 * mm, 67 * mm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    )
    story.append(header)
    story.append(Spacer(1, 1.5 * mm))
    story.append(
        Paragraph(
            "Career Service Centre Management Platform  \u00b7  Regulated by Nigerian Federal &amp; State Education Agencies",
            ST_TAGLINE,
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(HRFlowable(width="100%", thickness=1.6, color=_BRAND, spaceAfter=5 * mm))

    # ---------- Invoice meta grid ----------
    def meta_cell(label, value, width, color=_INK):
        return Table(
            [
                [Paragraph(label, ST_LABEL)],
                [Paragraph(str(value), _style("Val", fontName="PJS700", fontSize=9.5, leading=12, textColor=color))],
            ],
            colWidths=[width],
            style=TableStyle(
                [
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 1.5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 1.5),
                ]
            ),
        )

    meta = Table(
        [
            [
                meta_cell("INVOICE NO", invoice.invoice_number, 46 * mm),
                meta_cell("ISSUE DATE", _date(invoice.created_at), 38.7 * mm),
                meta_cell("DUE DATE", _date(invoice.due_date), 38.7 * mm),
                meta_cell("CURRENCY", invoice.currency or "NGN", 38.7 * mm),
            ]
        ],
        colWidths=[46 * mm, 38.7 * mm, 38.7 * mm, 38.7 * mm],
        style=TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, _BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, _BORDER),
                ("BACKGROUND", (0, 0), (-1, -1), _LIGHT),
            ]
        ),
    )
    story.append(meta)
    story.append(Spacer(1, 5 * mm))

    # ---------- Bill to ----------
    story.append(_section("BILLED TO"))
    story.append(Spacer(1, 2.5 * mm))
    bill_rows = [
        [Paragraph("INSTITUTION", ST_LABEL), Paragraph(invoice.institution.name, ST_BODY_BOLD)],
        [Paragraph("REGISTERED NAME", ST_LABEL), Paragraph(invoice.institution.short_name or "—", ST_BODY)],
        [Paragraph("CONTACT PERSON", ST_LABEL), Paragraph(f"{invoice.issued_to_name}  <{invoice.issued_to_email}>", ST_BODY)],
        [Paragraph("SUBSCRIPTION PLAN", ST_LABEL), Paragraph(invoice.plan_name or "—", ST_BODY)],
    ]
    bill = _box(bill_rows, [38 * mm, 124 * mm])
    bill.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), _LIGHT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(bill)
    story.append(Spacer(1, 5 * mm))

    # ---------- Line items ----------
    story.append(_section("INVOICE LINE ITEMS"))
    story.append(Spacer(1, 2.5 * mm))
    items = invoice.items_breakdown or [{"description": "Subscription License", "quantity": 1, "amount": invoice.subtotal_amount}]
    item_rows = [
        [
            Paragraph("DESCRIPTION", ST_HEAD),
            Paragraph("QTY", ST_HEAD),
            Paragraph("UNIT PRICE", ST_HEAD),
            Paragraph("AMOUNT", ST_HEAD),
        ]
    ]
    for item in items:
        item_rows.append(
            [
                Paragraph(str(item.get("description") or "Service"), ST_CELL),
                Paragraph(str(item.get("quantity", 1)), ST_CELL_CENTER),
                Paragraph(_money(item.get("unit_price", item.get("amount", 0))), ST_CELL_RIGHT),
                Paragraph(_money(item.get("amount", 0)), ST_CELL_RIGHT),
            ]
        )
    item_table = _box(item_rows, [76 * mm, 14 * mm, 36 * mm, 36 * mm], header_bg=_ROW)
    item_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), _ROW),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(item_table)
    story.append(Spacer(1, 4 * mm))

    # ---------- Amount summary ----------
    summary_rows = [
        [Paragraph("Subtotal", ST_BODY), Paragraph(_money(invoice.subtotal_amount), ST_CELL_RIGHT)],
        [Paragraph("Onboarding &amp; Setup Fee", ST_BODY), Paragraph(_money(invoice.setup_fee), ST_CELL_RIGHT)],
        [Paragraph("Discount", ST_BODY), Paragraph(_money(invoice.discount_amount), ST_CELL_RIGHT)],
        [Paragraph(f"Value Added Tax ({float(invoice.vat_rate):g}%)", ST_BODY), Paragraph(_money(invoice.vat_amount), ST_CELL_RIGHT)],
    ]
    summary = _box(summary_rows, [108 * mm, 54 * mm])
    summary.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), _WHITE),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ]
        )
    )
    story.append(summary)
    story.append(Spacer(1, 1.5 * mm))

    total = Table(
        [[Paragraph("TOTAL AMOUNT DUE", ST_TOTAL_LABEL), Paragraph(_money(invoice.total_amount), ST_TOTAL)]],
        colWidths=[108 * mm, 54 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), _BRAND),
                ("TOPPADDING", (0, 0), (-1, -1), 6.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        ),
    )
    story.append(total)
    story.append(Spacer(1, 5 * mm))

    # ---------- Bank details ----------
    bank = invoice.bank_details_snapshot or {}
    if bank:
        story.append(_section("PAYMENT METHOD \u2014 OFFICIAL COMPANY ACCOUNT"))
        story.append(Spacer(1, 2.5 * mm))
        bank_rows = [
            [Paragraph("ACCOUNT NAME", ST_LABEL), Paragraph(str(bank.get("account_name") or "—"), ST_BODY_BOLD)],
            [Paragraph("BANK", ST_LABEL), Paragraph(str(bank.get("bank_name") or "—"), ST_BODY)],
            [Paragraph("ACCOUNT NUMBER", ST_LABEL), Paragraph(str(bank.get("account_number") or "—"), ST_BODY_BOLD)],
            [Paragraph("SORT CODE / SWIFT", ST_LABEL), Paragraph(str(bank.get("sort_code_or_swift") or "—"), ST_BODY)],
            [Paragraph("CURRENCY", ST_LABEL), Paragraph(str(bank.get("currency") or "NGN"), ST_BODY)],
        ]
        bank_table = _box(bank_rows, [40 * mm, 122 * mm])
        bank_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), _LIGHT),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ]
            )
        )
        story.append(bank_table)
        instructions = bank.get("payment_instructions")
        if instructions:
            story.append(Spacer(1, 2 * mm))
            story.append(Paragraph(f"<b>Instructions:</b> {instructions}", ST_MUTED))
        story.append(Spacer(1, 5 * mm))

    # ---------- Payment evidence ----------
    has_evidence = invoice.payment_reference or invoice.payer_bank_name or invoice.payment_receipt_file
    if has_evidence:
        story.append(_section("PAYMENT EVIDENCE \u2014 SUBMITTED BY INSTITUTION"))
        story.append(Spacer(1, 2.5 * mm))
        ev_rows = [
            [Paragraph("PAYMENT REFERENCE", ST_LABEL), Paragraph(str(invoice.payment_reference or "—"), ST_BODY_BOLD)],
            [Paragraph("PAYER BANK", ST_LABEL), Paragraph(str(invoice.payer_bank_name or "—"), ST_BODY)],
            [Paragraph("PAYER ACCOUNT NAME", ST_LABEL), Paragraph(str(invoice.payer_account_name or "—"), ST_BODY)],
            [Paragraph("PAYMENT DATE", ST_LABEL), Paragraph(_date(invoice.payment_date), ST_BODY)],
            [Paragraph("SUBMITTED AT", ST_LABEL), Paragraph(str(invoice.payment_submitted_at or "—"), ST_BODY)],
            [Paragraph("PAYER NOTES", ST_LABEL), Paragraph(str(invoice.payment_notes or "—"), ST_BODY)],
        ]
        ev_table = _box(ev_rows, [40 * mm, 122 * mm])
        ev_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), _WHITE),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ]
            )
        )
        story.append(ev_table)
        story.append(Spacer(1, 5 * mm))

    # ---------- Verification note ----------
    if invoice.confirmed_at:
        story.append(HRFlowable(width="100%", thickness=0.5, color=_BORDER, spaceBefore=0, spaceAfter=3 * mm))
        if invoice.confirmed_by:
            story.append(
                Paragraph(
                    f'<font color="#166534"><b>Verified by {invoice.confirmed_by.get_full_name() or invoice.confirmed_by.email}'
                    f" on {_date(invoice.confirmed_at)}.</b></font>",
                    ST_MUTED,
                )
            )
        else:
            story.append(Paragraph(f'<font color="#166534"><b>Verified on {_date(invoice.confirmed_at)}.</b></font>', ST_MUTED))

    # ---------- Footer ----------
    def _footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont("PJS400", 7.5)
        canvas.setFillColor(_MUTED)
        canvas.drawCentredString(
            A4[0] / 2, 7 * mm, f"Nexus Edutech Consult Ltd  \u00b7  Invoice {invoice.invoice_number}  \u00b7  Page {doc_.page}"
        )
        canvas.restoreState()

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buffer.getvalue()