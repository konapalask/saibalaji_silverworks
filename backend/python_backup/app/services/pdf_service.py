import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from app.models.models import Quotation, WholesaleRequest

def generate_quotation_pdf(quotation: Quotation, request: WholesaleRequest) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    GOLD = colors.HexColor('#C5A059')
    CHARCOAL = colors.HexColor('#1A1918')
    SLATE = colors.HexColor('#4A4A4A')
    LIGHT_BG = colors.HexColor('#FBF9F5')
    BORDER_COLOR = colors.HexColor('#E6E1DA')

    # Custom Styles
    brand_title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=CHARCOAL,
        alignment=TA_LEFT
    )

    brand_subtitle_style = ParagraphStyle(
        'BrandSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=GOLD,
        alignment=TA_LEFT
    )

    header_meta_style = ParagraphStyle(
        'HeaderMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=SLATE,
        alignment=TA_RIGHT
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=GOLD,
        alignment=TA_LEFT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=CHARCOAL
    )

    body_regular = ParagraphStyle(
        'BodyRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=SLATE
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=CHARCOAL,
        alignment=TA_LEFT
    )

    table_cell_right = ParagraphStyle(
        'TableCellRight',
        parent=table_cell_style,
        alignment=TA_RIGHT
    )

    elements = []

    # 1. Header Block (Brand Title & Quotation Meta)
    header_left = [
        Paragraph("SAI BALAJI SILVERWORKS", brand_title_style),
        Paragraph("SILVER MANUFACTURERS & EXPORTERS", brand_subtitle_style),
        Paragraph("GSTIN: 36AAAAA0000A1Z5 | Reg: SB-SLV-8892<br/>Main Road, Silver Market, Hyderabad, TS - 500002<br/>Phone: +91 9492664870 | Email: wholesale@saibalajisilverworks.com", body_regular)
    ]

    header_right = [
        Paragraph(f"<b>OFFICIAL B2B QUOTATION</b>", ParagraphStyle('QTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=GOLD, alignment=TA_RIGHT)),
        Spacer(1, 4),
        Paragraph(f"<b>Quotation No:</b> {quotation.quotation_number}", header_meta_style),
        Paragraph(f"<b>Request No:</b> {request.request_number}", header_meta_style),
        Paragraph(f"<b>Date:</b> {quotation.created_at.strftime('%d %B %Y')}", header_meta_style),
        Paragraph(f"<b>Validity:</b> {quotation.valid_until}", header_meta_style),
    ]

    header_table = Table(
        [[header_left, header_right]],
        colWidths=[3.5 * inch, 4.0 * inch]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=GOLD, spaceAfter=12))

    # 2. Customer Information & Terms Grid
    cust_info = [
        Paragraph("CUSTOMER / CLIENT DETAILS", section_heading),
        Paragraph(f"<b>Company:</b> {request.company_name}", body_regular),
        Paragraph(f"<b>Contact Person:</b> {request.contact_person}", body_regular),
        Paragraph(f"<b>Phone:</b> {request.phone} | <b>Email:</b> {request.email}", body_regular),
        Paragraph(f"<b>GSTIN:</b> {request.gstin or 'N/A'}", body_regular),
        Paragraph(f"<b>Address:</b> {request.address}, {request.city}, {request.state} - {request.pincode}", body_regular),
    ]

    terms_info = [
        Paragraph("COMMERCIAL TERMS", section_heading),
        Paragraph(f"<b>Payment Terms:</b> {quotation.payment_terms}", body_regular),
        Paragraph(f"<b>Delivery Terms:</b> {quotation.delivery_terms}", body_regular),
        Paragraph(f"<b>Status:</b> {quotation.status.value.upper()}", body_regular),
        Paragraph(f"<b>Special Notes:</b> {quotation.notes or 'Standard Wholesale Terms Apply.'}", body_regular),
    ]

    info_table = Table(
        [[cust_info, terms_info]],
        colWidths=[4.0 * inch, 3.5 * inch]
    )
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 14))

    # 3. Product Specifications Table
    headers = [
        Paragraph("#", table_header_style),
        Paragraph("Product Description", table_header_style),
        Paragraph("SKU", table_header_style),
        Paragraph("Purity", table_header_style),
        Paragraph("Weight", table_header_style),
        Paragraph("Qty", table_header_style),
        Paragraph("Unit Price", table_header_style),
        Paragraph("Total (₹)", table_header_style),
    ]

    table_data = [headers]

    for idx, item in enumerate(quotation.items, 1):
        row = [
            Paragraph(str(idx), table_cell_style),
            Paragraph(item.product_name, table_cell_style),
            Paragraph(item.product_sku, table_cell_style),
            Paragraph(item.purity, table_cell_style),
            Paragraph(f"{item.weight_g}g", table_cell_style),
            Paragraph(str(item.quantity), table_cell_right),
            Paragraph(f"₹{item.unit_price:,.2f}", table_cell_right),
            Paragraph(f"₹{item.subtotal:,.2f}", table_cell_right),
        ]
        table_data.append(row)

    product_table = Table(
        table_data,
        colWidths=[0.3*inch, 2.2*inch, 0.9*inch, 1.0*inch, 0.7*inch, 0.5*inch, 0.9*inch, 1.0*inch]
    )
    product_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), CHARCOAL),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
    ]))
    elements.append(product_table)
    elements.append(Spacer(1, 12))

    # 4. Summary & Calculations Block
    summary_data = [
        [Paragraph("Subtotal:", body_bold), Paragraph(f"₹{quotation.subtotal:,.2f}", ParagraphStyle('R1', parent=body_regular, alignment=TA_RIGHT))],
        [Paragraph("Discount:", body_bold), Paragraph(f"- ₹{quotation.discount_amount:,.2f}", ParagraphStyle('R2', parent=body_regular, alignment=TA_RIGHT))],
        [Paragraph("GST (3% Silver Tax):", body_bold), Paragraph(f"+ ₹{quotation.tax_amount:,.2f}", ParagraphStyle('R3', parent=body_regular, alignment=TA_RIGHT))],
        [Paragraph("Insured Shipping & Handling:", body_bold), Paragraph(f"+ ₹{quotation.shipping_charge:,.2f}", ParagraphStyle('R4', parent=body_regular, alignment=TA_RIGHT))],
        [Paragraph("<b>GRAND TOTAL:</b>", ParagraphStyle('GT', parent=body_bold, fontSize=11, textColor=GOLD)), Paragraph(f"<b>₹{quotation.grand_total:,.2f}</b>", ParagraphStyle('R5', parent=body_bold, fontSize=11, textColor=GOLD, alignment=TA_RIGHT))],
    ]

    summary_table = Table(summary_data, colWidths=[2.2 * inch, 1.5 * inch])
    summary_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,-1), (-1,-1), 1, GOLD),
    ]))

    calc_wrapper = Table(
        [[Paragraph("<i>Note: All silver products carry official 925 / 999 Hallmark Certification. Prices valid as per current silver rate quote.</i>", ParagraphStyle('It', parent=body_regular, fontSize=8, textColor=SLATE)), summary_table]],
        colWidths=[3.8 * inch, 3.7 * inch]
    )
    calc_wrapper.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(calc_wrapper)

    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=10))

    # 5. Signatures & Footer
    sig_left = Paragraph("<b>Customer Acceptance</b><br/><br/><br/>_______________________<br/>Authorized Signatory & Stamp", body_regular)
    sig_right = Paragraph("<b>For SAI BALAJI SILVERWORKS</b><br/><br/><br/>_______________________<br/>Authorized Sales Manager", ParagraphStyle('SR', parent=body_regular, alignment=TA_RIGHT))

    sig_table = Table([[sig_left, sig_right]], colWidths=[3.75*inch, 3.75*inch])
    sig_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(sig_table)

    elements.append(Spacer(1, 15))
    elements.append(Paragraph("<center><b>Thank you for partnering with Sai Balaji Silverworks — Crafted in Silver. Designed to Last.</b></center>", ParagraphStyle('Foot', parent=body_regular, fontSize=8, textColor=GOLD)))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
