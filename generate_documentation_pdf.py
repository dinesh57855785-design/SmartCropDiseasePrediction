import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Flowable
)
from reportlab.pdfgen import canvas

# Global dictionary to store detected page numbers for TOC
SECTION_PAGES = {}

class SectionTracker(Flowable):
    """
    Invisible flowable that records the current page number for a given section key.
    """
    def __init__(self, key):
        super().__init__()
        self.key = key
        self.width = 0
        self.height = 0

    def draw(self):
        SECTION_PAGES[self.key] = self.canv._pageNumber


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count,
    running headers, running footers, and decorative borders.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Do not draw running headers/footers on Title Page (Page 1)
        if self._pageNumber == 1:
            # Draw decorative border on Cover Page
            self.saveState()
            self.setStrokeColor(colors.HexColor("#1B4D3E"))
            self.setLineWidth(2)
            self.rect(30, 30, 595 - 60, 842 - 60)
            self.setStrokeColor(colors.HexColor("#52B788"))
            self.setLineWidth(0.75)
            self.rect(34, 34, 595 - 68, 842 - 68)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Running Header
        self.drawString(54, 842 - 36, "SMARTCROP: AI-Based Crop Disease Prediction & Smart Farming Assistant")
        self.drawRightString(595 - 54, 842 - 36, "Sacred Heart College (Autonomous)")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.6)
        self.line(54, 842 - 42, 595 - 54, 842 - 42)

        # Running Footer
        self.line(54, 45, 595 - 54, 45)
        self.drawString(54, 32, "B.Sc. Computer Science Academic Project Report (2024 – 2027)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(595 - 54, 32, page_str)

        self.restoreState()


def generate_story(styles, toc_page_map=None):
    if toc_page_map is None:
        toc_page_map = {}

    PRIMARY = colors.HexColor("#1B4D3E")     # Deep Emerald Green
    SECONDARY = colors.HexColor("#2D6A4F")   # Medium Green
    ACCENT = colors.HexColor("#52B788")      # Leaf Green Accent
    DARK_TEXT = colors.HexColor("#1A202C")   # Charcoal
    MUTED_TEXT = colors.HexColor("#4A5568")  # Slate Gray
    BORDER_COLOR = colors.HexColor("#CBD5E0")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BOX_BG = colors.HexColor("#F0FDF4")      # Pale Green Tint

    title_style = ParagraphStyle(
        'CoverTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=24, leading=29,
        textColor=PRIMARY, alignment=1, spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12.5, leading=17,
        textColor=SECONDARY, alignment=1, spaceAfter=16
    )

    report_type_style = ParagraphStyle(
        'CoverReportType', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        textColor=DARK_TEXT, alignment=1, spaceAfter=8
    )

    institution_style = ParagraphStyle(
        'CoverInstitution', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12, leading=16,
        textColor=PRIMARY, alignment=1, spaceAfter=4
    )

    h1_style = ParagraphStyle(
        'AcademicH1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        textColor=PRIMARY, spaceBefore=12, spaceAfter=6, keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'AcademicH2', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14.5,
        textColor=SECONDARY, spaceBefore=8, spaceAfter=3, keepWithNext=True
    )

    body_style = ParagraphStyle(
        'AcademicBody', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12.5,
        textColor=DARK_TEXT, alignment=4, spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'AcademicBullet', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=DARK_TEXT, leftIndent=12, spaceAfter=2.5
    )

    callout_style = ParagraphStyle(
        'AcademicCallout', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, leading=11.5,
        textColor=DARK_TEXT, alignment=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=10.5,
        textColor=colors.white, alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.5, leading=10,
        textColor=DARK_TEXT
    )

    table_cell_center = ParagraphStyle(
        'TableCellCenter', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.5, leading=10,
        textColor=DARK_TEXT, alignment=1
    )

    code_style = ParagraphStyle(
        'CodeSnippet', parent=styles['Normal'],
        fontName='Courier', fontSize=6.5, leading=8.5,
        textColor=colors.HexColor("#1A202C")
    )

    story = []

    # =========================================================================
    # COVER / TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 25))
    story.append(Paragraph("SMARTCROP", title_style))
    story.append(Paragraph("AI-BASED CROP DISEASE PREDICTION<br/>AND SMART FARMING ASSISTANT", subtitle_style))

    story.append(HRFlowable(width="75%", thickness=1.5, color=PRIMARY, spaceAfter=18, spaceBefore=4))

    story.append(Paragraph("PROJECT DOCUMENTATION REPORT", report_type_style))
    story.append(Paragraph("Submitted in partial fulfillment of the requirements for the degree of", ParagraphStyle('SubSub', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, alignment=1, textColor=MUTED_TEXT, spaceAfter=6)))
    story.append(Paragraph("Bachelor of Science in Computer Science", institution_style))
    story.append(Paragraph("Sacred Heart College – Autonomous – Tirupattur", institution_style))
    story.append(Paragraph("Academic Year: 2024 – 2027", ParagraphStyle('AY', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14, alignment=1, textColor=SECONDARY, spaceAfter=20)))

    # Student Details Table
    student_data = [
        [Paragraph("<b>S.No.</b>", table_header_style), Paragraph("<b>Student Name</b>", table_header_style), Paragraph("<b>Register / Roll Number</b>", table_header_style), Paragraph("<b>Department & Degree</b>", table_header_style)],
        [Paragraph("1", table_cell_center), Paragraph("Bala Adithya", table_cell_style), Paragraph("BU240527", table_cell_center), Paragraph("B.Sc. Computer Science", table_cell_style)],
        [Paragraph("2", table_cell_center), Paragraph("Nirmal Antony", table_cell_style), Paragraph("BU240529", table_cell_center), Paragraph("B.Sc. Computer Science", table_cell_style)],
        [Paragraph("3", table_cell_center), Paragraph("Naveen", table_cell_style), Paragraph("BU240544", table_cell_center), Paragraph("B.Sc. Computer Science", table_cell_style)],
        [Paragraph("4", table_cell_center), Paragraph("Dinesh V", table_cell_style), Paragraph("BU240554", table_cell_center), Paragraph("B.Sc. Computer Science", table_cell_style)],
    ]

    t_students = Table(student_data, colWidths=[35, 140, 120, 150])
    t_students.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
    ]))
    story.append(t_students)

    story.append(Spacer(1, 20))

    # Project Guide Info Box
    guide_data = [
        [Paragraph("<b>Project Guide:</b>", ParagraphStyle('PGH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, textColor=PRIMARY)),
         Paragraph("<b>Mrs. Archana</b><br/><font size=8 color='#4A5568'>Department of Computer Science<br/>Sacred Heart College (Autonomous), Tirupattur</font>", ParagraphStyle('PGB', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12))]
    ]
    t_guide = Table(guide_data, colWidths=[110, 335])
    t_guide.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BOX_BG),
        ('BOX', (0, 0), (-1, -1), 1, SECONDARY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_guide)

    story.append(PageBreak())

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    story.append(Paragraph("TABLE OF CONTENTS", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10, spaceBefore=2))

    def get_pg(key, default):
        return str(toc_page_map.get(key, default))

    toc_data = [
        [Paragraph("<b>Sec No.</b>", table_header_style), Paragraph("<b>Section Title</b>", table_header_style), Paragraph("<b>Page</b>", table_header_style)],
        [Paragraph("<b>01</b>", table_cell_center), Paragraph("<b>ABSTRACT</b>", table_cell_style), Paragraph(get_pg("sec_01", "3"), table_cell_center)],
        [Paragraph("<b>02</b>", table_cell_center), Paragraph("<b>INTRODUCTION</b>", table_cell_style), Paragraph(get_pg("sec_02", "3"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("2.1 Background of Smart Agriculture & Modern Technology", table_cell_style), Paragraph(get_pg("sec_02", "3"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("2.2 Artificial Intelligence & Crop Disease Detection", table_cell_style), Paragraph(get_pg("sec_02", "3"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("2.3 Weather-Based Decisions, Irrigation & Digital Assistance", table_cell_style), Paragraph(get_pg("sec_02", "3"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("2.4 Voice-Based HCI & Unified Farming Platform Overview", table_cell_style), Paragraph(get_pg("sec_02", "4"), table_cell_center)],
        [Paragraph("<b>03</b>", table_cell_center), Paragraph("<b>PROBLEM STATEMENT</b>", table_cell_style), Paragraph(get_pg("sec_03", "4"), table_cell_center)],
        [Paragraph("<b>04</b>", table_cell_center), Paragraph("<b>PROBLEM SOLUTION</b>", table_cell_style), Paragraph(get_pg("sec_04", "5"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("4.1 – 4.5 AI Prediction, Services, Weather, Irrigation & History", table_cell_style), Paragraph(get_pg("sec_04", "5"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("4.6 – 4.11 Chatbot, Planner, Alerts, Profiles, Reports & Voice Interaction", table_cell_style), Paragraph(get_pg("sec_04", "5"), table_cell_center)],
        [Paragraph("<b>05</b>", table_cell_center), Paragraph("<b>SYSTEM REQUIREMENTS</b>", table_cell_style), Paragraph(get_pg("sec_05", "6"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("5.1 System Software Requirements | 5.2 System Hardware Requirements", table_cell_style), Paragraph(get_pg("sec_05", "6"), table_cell_center)],
        [Paragraph("<b>06</b>", table_cell_center), Paragraph("<b>ADVANTAGES OF SMARTCROP</b>", table_cell_style), Paragraph(get_pg("sec_06", "7"), table_cell_center)],
        [Paragraph("<b>07</b>", table_cell_center), Paragraph("<b>SYSTEM MODULES (7.1 to 7.13)</b>", table_cell_style), Paragraph(get_pg("sec_07", "7"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("7.1 User Auth | 7.2 Dashboard | 7.3 Prediction (Lead/Soil/Water)", table_cell_style), Paragraph(get_pg("sec_07", "7"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("7.4 History | 7.5 Weather & Irrigation | 7.6 AI Chatbot", table_cell_style), Paragraph(get_pg("sec_07", "8"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("7.7 Planner | 7.8 Alerts | 7.9 Profile | 7.10 PDF Reports", table_cell_style), Paragraph(get_pg("sec_07", "9"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("7.11 Backend/API | 7.12 AI/ML Engine | 7.13 Voice/Microphone Module", table_cell_style), Paragraph(get_pg("sec_07", "9"), table_cell_center)],
        [Paragraph("<b>08</b>", table_cell_center), Paragraph("<b>SYSTEM ARCHITECTURE</b>", table_cell_style), Paragraph(get_pg("sec_08", "10"), table_cell_center)],
        [Paragraph("<b>09</b>", table_cell_center), Paragraph("<b>SYSTEM WORKFLOW</b>", table_cell_style), Paragraph(get_pg("sec_09", "11"), table_cell_center)],
        [Paragraph("<b>10</b>", table_cell_center), Paragraph("<b>USER INTERFACE DESCRIPTION</b>", table_cell_style), Paragraph(get_pg("sec_10", "12"), table_cell_center)],
        [Paragraph("", table_cell_center), Paragraph("10.1 Desktop/Web Interface | 10.2 Flutter Mobile Interface", table_cell_style), Paragraph(get_pg("sec_10", "12"), table_cell_center)],
        [Paragraph("<b>11</b>", table_cell_center), Paragraph("<b>DATABASE & DATA MANAGEMENT</b>", table_cell_style), Paragraph(get_pg("sec_11", "13"), table_cell_center)],
        [Paragraph("<b>12</b>", table_cell_center), Paragraph("<b>API COMMUNICATION & ENDPOINTS</b>", table_cell_style), Paragraph(get_pg("sec_12", "14"), table_cell_center)],
        [Paragraph("<b>13</b>", table_cell_center), Paragraph("<b>SYSTEM TESTING & VERIFICATION</b>", table_cell_style), Paragraph(get_pg("sec_13", "15"), table_cell_center)],
        [Paragraph("<b>14</b>", table_cell_center), Paragraph("<b>ADVANTAGES AND LIMITATIONS</b>", table_cell_style), Paragraph(get_pg("sec_14", "16"), table_cell_center)],
        [Paragraph("<b>15</b>", table_cell_center), Paragraph("<b>FUTURE ENHANCEMENTS</b>", table_cell_style), Paragraph(get_pg("sec_15", "16"), table_cell_center)],
        [Paragraph("<b>16</b>", table_cell_center), Paragraph("<b>CONCLUSION</b>", table_cell_style), Paragraph(get_pg("sec_16", "17"), table_cell_center)],
        [Paragraph("<b>17</b>", table_cell_center), Paragraph("<b>REFERENCES</b>", table_cell_style), Paragraph(get_pg("sec_17", "17"), table_cell_center)],
    ]

    t_toc = Table(toc_data, colWidths=[55, 345, 45])
    t_toc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_toc)

    story.append(PageBreak())

    # =========================================================================
    # 01. ABSTRACT
    # =========================================================================
    story.append(SectionTracker("sec_01"))
    story.append(Paragraph("01. ABSTRACT", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    abstract_text = (
        "Agriculture forms the vital economic backbone of human society, ensuring global food security and sustainable livelihoods. "
        "However, modern farmers encounter persistent operational hurdles, including fluctuating climatic conditions, sudden pest outbreaks, "
        "and destructive crop diseases that cause severe yield losses when left undetected. Conventional agricultural diagnosis relies "
        "predominantly on visual inspection by field specialists—a manual approach constrained by geographical distances, high consultancy costs, "
        "and unavoidable diagnostic delays. To address these critical challenges, this project introduces <b>SmartCrop: AI-Based Crop Disease Prediction "
        "and Smart Farming Assistant</b>, a centralized, intelligent precision agriculture platform developed for academic submission at Sacred Heart "
        "College (Autonomous), Tirupattur.<br/><br/>"
        "SmartCrop integrates computer vision, statistical machine learning models, agro-meteorological analytics, and assistive digital tools into a "
        "unified ecosystem. The system enables automated crop disease identification from leaf imagery, coupled with comprehensive multi-parameter "
        "evaluations of soil fertility (NPK, pH, micronutrients) and irrigation water suitability. Powered by a robust Python/Django REST framework backend, "
        "the platform delivers synchronized data to both a responsive React web/desktop application and a cross-platform Flutter mobile client. "
        "SmartCrop enriches the user experience by offering automated 14-day weather-based farming advisory, intelligent irrigation guidance, historical "
        "diagnostic logging, an interactive agricultural chatbot, bi-directional voice/microphone interaction with regional language support (Tamil and English), "
        "a customized 14-day farming activity planner, proactive environmental alerts, and instant bilingual PDF agronomy report generation. "
        "By consolidating advanced artificial intelligence, IoT telemetry ingestion, and accessible human-computer interfaces into one streamlined system, "
        "SmartCrop bridges the accessibility gap between advanced agricultural technologies and everyday farming operations."
    )
    story.append(Paragraph(abstract_text, body_style))

    # =========================================================================
    # 02. INTRODUCTION
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_02"))
    story.append(Paragraph("02. INTRODUCTION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("2.1 Background of Smart Agriculture", h2_style))
    story.append(Paragraph(
        "Smart agriculture represents the strategic application of modern information and communication technologies (ICT) to agricultural production. "
        "By leveraging automated data gathering, digital modeling, and computational decision-support tools, modern farming transitions from traditional, "
        "empirical methods toward data-driven precision farming that optimizes resource utilization.",
        body_style
    ))

    story.append(Paragraph("2.2 Agriculture and Modern Technology", h2_style))
    story.append(Paragraph(
        "Technological convergence across cloud computing, microcontrollers, distributed REST APIs, and responsive mobile interfaces empowers farmers with "
        "instant access to dynamic agronomic knowledge. Modern software bridges the informational disconnect between lab-based scientific research and on-field execution.",
        body_style
    ))

    story.append(Paragraph("2.3 Artificial Intelligence in Agriculture", h2_style))
    story.append(Paragraph(
        "Artificial Intelligence (AI) and Machine Learning (ML) algorithms excel at recognizing complex spatial patterns and multi-variable correlations in agricultural datasets. "
        "In SmartCrop, deep Convolutional Neural Networks (CNNs) process plant leaf images for disease classification, while supervised machine learning models analyze soil and water chemistry.",
        body_style
    ))

    story.append(Paragraph("2.4 Crop Disease Detection", h2_style))
    story.append(Paragraph(
        "Crop pathologies—including fungal blights, bacterial spots, viral curls, and foliar rusts—exhibit distinct visual signatures on plant leaves. "
        "Automating their detection through computer vision drastically minimizes human error, standardizes diagnostic quality, and facilitates prompt remedial intervention.",
        body_style
    ))

    story.append(Paragraph("2.5 Importance of Early Disease Identification", h2_style))
    story.append(Paragraph(
        "Delayed disease recognition frequently results in uncontrollable epidemic spread across contiguous fields, necessitating extensive chemical spraying or causing complete harvest failure. "
        "Early, localized detection preserves crop health, prevents crop loss, and promotes targeted, cost-effective bio-friendly treatments.",
        body_style
    ))

    story.append(Paragraph("2.6 Weather-Based Farming Decisions", h2_style))
    story.append(Paragraph(
        "Farm operations such as sowing, foliar chemical spraying, weeding, and harvesting are heavily contingent on micro-climatic parameters. "
        "Integrating real-time meteorological forecasting enables farmers to plan activities proactively—avoiding spray run-off from untimely rains or seedling heat stress.",
        body_style
    ))

    story.append(Paragraph("2.7 Smart Irrigation", h2_style))
    story.append(Paragraph(
        "Water conservation and root-zone moisture regulation are fundamental to sustainable agriculture. SmartCrop leverages ambient weather forecasts and sensor-driven soil moisture "
        "telemetry to provide automated irrigation guidance, preventing both root asphyxiation from waterlogging and drought-induced crop wilting.",
        body_style
    ))

    story.append(Paragraph("2.8 Digital Farming Assistance", h2_style))
    story.append(Paragraph(
        "Beyond isolated predictions, modern farmers require comprehensive digital guidance covering organic remedy recipes, chemical dosage precautions, stage-wise crop growth calendars, "
        "and downloadable field reports to track farm health over extended cultivation cycles.",
        body_style
    ))

    story.append(Paragraph("2.9 Voice-Based Human-Computer Interaction", h2_style))
    story.append(Paragraph(
        "Many agricultural practitioners encounter barriers with conventional text-heavy mobile and desktop user interfaces due to language, literacy, or field operating conditions. "
        "Integrating voice recognition and speech synthesis enables hands-free, intuitive voice navigation across all platform features in both regional (Tamil) and English languages.",
        body_style
    ))

    story.append(Paragraph("2.10 Need for a Unified Farming Platform", h2_style))
    story.append(Paragraph(
        "Fragmented tools that require switching between separate apps for weather, disease testing, irrigation timers, and agronomic guidance increase user friction. "
        "A centralized platform integrating all these facets under a cohesive backend and consistent UI ensures streamlined, holistic farm management.",
        body_style
    ))

    story.append(Paragraph("2.11 Overview of SmartCrop", h2_style))
    story.append(Paragraph(
        "SmartCrop establishes an end-to-end smart agriculture solution uniting a Django REST backend, deep learning vision models, tabular machine learning soil/water analyzers, "
        "Open-Meteo weather intelligence, a React desktop interface, a Flutter mobile client, and Web Speech voice control into an accessible, production-ready system.",
        body_style
    ))

    # =========================================================================
    # 03. PROBLEM STATEMENT
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_03"))
    story.append(Paragraph("03. PROBLEM STATEMENT", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "Traditional agricultural management across developing agricultural sectors faces severe systemic bottlenecks that impede efficient cultivation and farm sustainability:",
        body_style
    ))
    story.append(Paragraph("• <b>Manual & Subjective Diagnosis:</b> Farmers rely on naked-eye observation to identify foliar blights and pest attacks, frequently misdiagnosing pathogen types.", bullet_style))
    story.append(Paragraph("• <b>Scarcity of Agricultural Specialists:</b> Qualified agronomists and extension officers are sparsely distributed across rural zones, leading to diagnostic delays.", bullet_style))
    story.append(Paragraph("• <b>Inappropriate Remedial Measures:</b> Inaccurate disease identification causes inappropriate chemical pesticide usage, destroying soil health and raising input costs.", bullet_style))
    story.append(Paragraph("• <b>Weather Uncertainty & Irrigation Mismanagement:</b> Sowing or spraying immediately prior to unpredicted rainfall causes severe chemical wastage and crop vulnerability.", bullet_style))
    story.append(Paragraph("• <b>Lack of Historical Tracking:</b> Farmers rarely maintain structured logs of historical disease outbreaks, soil fertility changes, or seasonal treatments.", bullet_style))
    story.append(Paragraph("• <b>Interface Literacy & Accessibility Barriers:</b> Complex, text-heavy applications hinder accessibility for non-technical rural users who benefit significantly from voice interfaces.", bullet_style))
    story.append(Paragraph("• <b>Fragmented Digital Solutions:</b> Farmers must navigate separate disconnected tools for weather, disease scanning, soil data, and agronomic advice.", bullet_style))
    story.append(Paragraph(
        "Therefore, there is an urgent academic and practical necessity to design and deploy a unified, accessible, and intelligent agricultural assistant that combines AI vision diagnosis, "
        "soil/water chemistry analysis, weather advisory, voice navigation, and centralized activity planning.",
        body_style
    ))

    # =========================================================================
    # 04. PROBLEM SOLUTION
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_04"))
    story.append(Paragraph("04. PROBLEM SOLUTION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("4.1 AI-Based Crop Disease Prediction", h2_style))
    story.append(Paragraph(
        "SmartCrop provides automated image-based foliar diagnosis using deep Convolutional Neural Networks. Farmers upload leaf images from mobile cameras or file selectors, "
        "which the backend preprocesses, normalizes, and evaluates to deliver identified disease classes, confidence bands, and dual organic/chemical treatment advice.",
        body_style
    ))

    story.append(Paragraph("4.2 Digital Farming Assistance", h2_style))
    story.append(Paragraph(
        "The system aggregates crop health diagnosis, stage-wise growth roadmaps, soil nutrient monitoring, irrigation water quality evaluation, and localized weather forecasts into a unified portal.",
        body_style
    ))

    story.append(Paragraph("4.3 Weather Information", h2_style))
    story.append(Paragraph(
        "Utilizing real-time geo-coordinates, SmartCrop fetches 14-day forecasts from Open-Meteo, computing temperature extremes, precipitation accumulation, wind speeds, and relative humidity.",
        body_style
    ))

    story.append(Paragraph("4.4 Irrigation Assistance", h2_style))
    story.append(Paragraph(
        "The platform synthesizes rainfall probability, evapotranspiration indicators, and IoT soil moisture telemetry to generate clear irrigation schedules, advising whether to irrigate or conserve water.",
        body_style
    ))

    story.append(Paragraph("4.5 Prediction History", h2_style))
    story.append(Paragraph(
        "Every disease diagnosis is stored in a relational database linked to the user's account, enabling farmers to review chronological diagnosis records, confidence metrics, and historical treatments.",
        body_style
    ))

    story.append(Paragraph("4.6 AI Chatbot Assistance", h2_style))
    story.append(Paragraph(
        "A contextual, rule-based agronomic chatbot delivers instant conversational answers regarding leaf yellowing, blight symptoms, organic neem mixtures, fertilizer dosages, and spray timings.",
        body_style
    ))

    story.append(Paragraph("4.7 Farming Planner", h2_style))
    story.append(Paragraph(
        "A 14-day crop activity planner combines crop type, current growth stage, and upcoming meteorological conditions to provide actionable daily field tasks, precautions, and operational badges.",
        body_style
    ))

    story.append(Paragraph("4.8 Alerts", h2_style))
    story.append(Paragraph(
        "Dynamic risk-scoring algorithms generate automated warnings for high fungal blight risk during humid spells, heat stress alerts during temperature spikes, and waterlogging risks during heavy rain.",
        body_style
    ))

    story.append(Paragraph("4.9 User Profile and Account Management", h2_style))
    story.append(Paragraph(
        "Secure JWT-based authentication enables user registration, login, session persistence, role assignment (Farmer, Agronomist, Researcher), and profile management across both web and mobile clients.",
        body_style
    ))

    story.append(Paragraph("4.10 Report/PDF Generation", h2_style))
    story.append(Paragraph(
        "SmartCrop features a bilingual (English & Tamil) PDF report generator that compiles crop disease diagnoses, confidence evaluations, soil/water parameters, and customized treatments into printable documentation.",
        body_style
    ))

    story.append(Paragraph("4.11 Voice/Microphone Interaction", h2_style))
    story.append(Paragraph(
        "SmartCrop integrates microphone-based voice interaction to enable hands-free voice navigation and speech input. "
        "The interaction workflow is structured as follows:",
        body_style
    ))

    voice_flow_box = [
        [Paragraph(
            "<b>Voice Interaction Workflow:</b><br/>"
            "User Speaks → Microphone Captures Audio Stream → Browser/App Speech Engine Processes Speech → "
            "Recognized Text Command Evaluated Against Intent Map → SmartCrop Feature/Navigation Executed → "
            "Visual Status Toast & Text-to-Speech (TTS) Feedback Returned",
            callout_style
        )]
    ]
    t_vflow = Table(voice_flow_box, colWidths=[485])
    t_vflow.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BOX_BG),
        ('BOX', (0, 0), (-1, -1), 1, SECONDARY),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_vflow)

    story.append(PageBreak())

    # =========================================================================
    # 05. SYSTEM REQUIREMENTS
    # =========================================================================
    story.append(SectionTracker("sec_05"))
    story.append(Paragraph("05. SYSTEM REQUIREMENTS", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("5.1 System Software Requirements", h2_style))
    sw_data = [
        [Paragraph("<b>Technology / Component</b>", table_header_style), Paragraph("<b>Version / Specification</b>", table_header_style), Paragraph("<b>Purpose in SmartCrop Project</b>", table_header_style)],
        [Paragraph("Operating System", table_cell_style), Paragraph("Windows 10 / 11 (64-bit) / Linux", table_cell_style), Paragraph("Development environment and server host runtime", table_cell_style)],
        [Paragraph("Python Runtime", table_cell_style), Paragraph("Python 3.10 / 3.11 / 3.12", table_cell_style), Paragraph("Core language for Django backend and AI inference scripts", table_cell_style)],
        [Paragraph("Django Framework", table_cell_style), Paragraph("Django 5.0+ with Django REST Framework", table_cell_style), Paragraph("Scalable RESTful API development, ORM, and request routing", table_cell_style)],
        [Paragraph("Authentication", table_cell_style), Paragraph("djangorestframework-simplejwt", table_cell_style), Paragraph("Stateless JSON Web Token (JWT) user authentication", table_cell_style)],
        [Paragraph("Deep Learning & Vision", table_cell_style), Paragraph("TensorFlow / Keras 2.x, OpenCV, NumPy", table_cell_style), Paragraph("MobileNetV2 CNN model architecture and leaf image preprocessing", table_cell_style)],
        [Paragraph("Tabular Machine Learning", table_cell_style), Paragraph("Scikit-Learn, Pandas, Joblib", table_cell_style), Paragraph("Soil fertility & water quality model pipelines and serialization", table_cell_style)],
        [Paragraph("Relational Database", table_cell_style), Paragraph("SQLite (Dev) / PostgreSQL (Prod)", table_cell_style), Paragraph("Storage of users, prediction records, soil/water logs, and disease data", table_cell_style)],
        [Paragraph("Frontend Framework", table_cell_style), Paragraph("React 18, Vite, Vanilla CSS", table_cell_style), Paragraph("Interactive desktop and responsive web client interface", table_cell_style)],
        [Paragraph("Mobile Framework", table_cell_style), Paragraph("Flutter SDK 3.x, Dart 3.x", table_cell_style), Paragraph("Cross-platform native mobile application for Android/iOS", table_cell_style)],
        [Paragraph("Mobile Core Packages", table_cell_style), Paragraph("http, image_picker, shared_preferences", table_cell_style), Paragraph("REST API communication, camera capture, and local token storage", table_cell_style)],
        [Paragraph("Mobile PDF & Printing", table_cell_style), Paragraph("pdf ^3.0.0, printing ^5.13.0", table_cell_style), Paragraph("On-device PDF report generation and native document printing", table_cell_style)],
        [Paragraph("Cloud Integration", table_cell_style), Paragraph("firebase_core ^4.15.0", table_cell_style), Paragraph("Firebase initialization for mobile platform support", table_cell_style)],
        [Paragraph("Speech Recognition API", table_cell_style), Paragraph("W3C Web Speech API (SpeechRecognition)", table_cell_style), Paragraph("Voice capture, speech-to-text processing, and voice navigation", table_cell_style)],
        [Paragraph("Weather Data Service", table_cell_style), Paragraph("Open-Meteo Weather API", table_cell_style), Paragraph("Real-time 14-day agro-climatic forecasting without API keys", table_cell_style)],
        [Paragraph("IDE & Version Control", table_cell_style), Paragraph("Visual Studio Code, Git, GitHub", table_cell_style), Paragraph("Source code editing, debugging, testing, and collaboration", table_cell_style)],
    ]
    t_sw = Table(sw_data, colWidths=[115, 145, 225])
    t_sw.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_sw)

    story.append(Spacer(1, 4))
    story.append(Paragraph("5.2 System Hardware Requirements", h2_style))
    hw_data = [
        [Paragraph("<b>Category</b>", table_header_style), Paragraph("<b>Development Environment Minimum</b>", table_header_style), Paragraph("<b>End-User Target Minimum</b>", table_header_style)],
        [Paragraph("Processor (CPU)", table_cell_style), Paragraph("Intel Core i5 / AMD Ryzen 5 (4+ Cores)", table_cell_style), Paragraph("1.5 GHz Quad-Core Mobile / Desktop CPU", table_cell_style)],
        [Paragraph("System Memory (RAM)", table_cell_style), Paragraph("8 GB RAM minimum (16 GB recommended)", table_cell_style), Paragraph("2 GB RAM on Mobile / 4 GB on PC", table_cell_style)],
        [Paragraph("Storage Capacity", table_cell_style), Paragraph("20 GB available SSD storage", table_cell_style), Paragraph("150 MB available internal storage", table_cell_style)],
        [Paragraph("Input / Capture Devices", table_cell_style), Paragraph("Microphone, Webcam, USB Cable", table_cell_style), Paragraph("Integrated Camera (5+ MP) & Microphone", table_cell_style)],
        [Paragraph("Network Connectivity", table_cell_style), Paragraph("Broadband Internet / Local Wi-Fi", table_cell_style), Paragraph("Active 3G / 4G / 5G / Wi-Fi connection", table_cell_style)],
        [Paragraph("IoT Hardware (Optional)", table_cell_style), Paragraph("ESP32 Dev Board, DHT22, Soil Sensor", table_cell_style), Paragraph("Standard farm Wi-Fi / Sensor Node gateway", table_cell_style)],
    ]
    t_hw = Table(hw_data, colWidths=[110, 185, 190])
    t_hw.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_hw)

    # =========================================================================
    # 06. ADVANTAGES
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_06"))
    story.append(Paragraph("06. ADVANTAGES OF SMARTCROP", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("• <b>Early Foliar Disease Detection:</b> Accelerates diagnosis of critical plant pathologies, enabling early remedy before irreversible crop damage occurs.", bullet_style))
    story.append(Paragraph("• <b>Dual Treatment Advice:</b> Provides actionable biological/organic remedies alongside approved chemical dosages with clear safety precautions.", bullet_style))
    story.append(Paragraph("• <b>Centralized Multi-Domain Diagnostics:</b> Combines leaf image vision, soil chemistry assessment, and water quality testing in one platform.", bullet_style))
    story.append(Paragraph("• <b>Weather-Aware Farming Schedules:</b> Delivers 14-day forecasts with automated recommendations for optimal planting, spraying, and irrigation windows.", bullet_style))
    story.append(Paragraph("• <b>Voice/Microphone Accessibility:</b> Reduces typing dependency, allowing users to navigate and trigger features via spoken voice commands in English and Tamil.", bullet_style))
    story.append(Paragraph("• <b>Cross-Platform Synchronization:</b> Consistent user experience across modern desktop/web browsers and native Flutter Android/iOS mobile applications.", bullet_style))
    story.append(Paragraph("• <b>Automated Agronomy Reporting:</b> Generates comprehensive digital and printable bilingual PDF summaries for field record keeping.", bullet_style))
    story.append(Paragraph("• <b>Modular & Scalable Architecture:</b> Built with decoupled Django REST APIs, allowing seamless integration with external sensors and expanded crop models.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # 07. SYSTEM MODULES
    # =========================================================================
    story.append(SectionTracker("sec_07"))
    story.append(Paragraph("07. SYSTEM MODULES", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    modules = [
        ("7.1 USER REGISTRATION AND AUTHENTICATION MODULE",
         "Provide secure user account creation, token-based login, and session persistence.",
         "Manages user registration, credential validation, cryptographic password hashing via Django's auth system, "
         "and stateless JWT token issuance using djangorestframework-simplejwt. Frontends persist tokens locally to authenticate all protected API endpoints.",
         "JSON response with JWT access/refresh tokens and user profile upon success, or structured field validation error messages upon failure."),

        ("7.2 DASHBOARD MODULE",
         "Provide a centralized real-time overview of farming statistics and diagnostic activity.",
         "Aggregates total disease predictions, healthy versus diseased plant counts, breakdown of top detected diseases, "
         "and chronological recent prediction cards. Offers quick navigation shortcuts to all platform diagnostic tools.",
         "Interactive graphical dashboard displaying statistical metric cards, disease distribution summaries, and recent diagnostic activity."),

        ("7.3 CROP DISEASE PREDICTION MODULE",
         "Assist users in identifying foliar crop diseases using AI computer vision inference.",
         "Accepts leaf image uploads from camera or gallery alongside optional crop type hints (Tomato, Potato, Corn, Apple, Grape, Pepper, Rice, Cotton, etc.). "
         "The backend executes image preprocessing (224x224 RGB normalization), runs deep learning inference, validates confidence bands, "
         "and retrieves comprehensive symptoms, organic remedies, and chemical instructions.",
         "Detailed disease diagnosis report showing detected disease, confidence percentage, health status, symptoms, organic remedies, and chemical treatments."),

        ("7.4 PREDICTION HISTORY MODULE",
         "Allow users to review, filter, and inspect past crop disease prediction records.",
         "Retrieves and paginates historical prediction logs from the relational database filtered by the authenticated user's ID. "
         "Presents stored leaf images, timestamps, detected disease labels, confidence scores, and past treatment advice.",
         "Readable list and interactive cards of previous diagnostic predictions with image previews and full detail view options."),

        ("7.5 WEATHER AND IRRIGATION MODULE",
         "Provide 14-day meteorological forecasting, agro-climatic risk analysis, and smart irrigation support.",
         "Consumes real-time Open-Meteo weather data based on geographic coordinates. Evaluates maximum/minimum temperatures, rainfall accumulation, "
         "wind velocity, and humidity to compute fungal disease risk, heat stress, waterlogging risk, and irrigation requirements.",
         "Structured 14-day weather statistics, risk indicator badges, and actionable advice for sowing, spraying, and irrigation."),

        ("7.6 AI CHATBOT MODULE",
         "Provide responsive conversational agricultural assistance for farmer inquiries.",
         "Implements a context-aware pattern matching and intent classification engine that responds to farmer questions regarding leaf yellowing, "
         "fungal spots, early/late blight symptoms, organic neem mixtures, fertilizer schedules, and watering guidelines.",
         "Conversational assistance messages with contextual quick-reply suggestion chips for follow-up inquiries."),

        ("7.7 FARMING PLANNER MODULE",
         "Help farmers organize, schedule, and execute stage-wise crop management tasks.",
         "Generates a 14-day customized daily action plan based on selected crop type, active growth stage (Seedling, Vegetative, Flowering, Fruiting, Harvest), "
         "and forecasted weather conditions. Categorizes tasks into recommended activities, activities to avoid, and operational badges.",
         "Chronological 14-day daily farming task matrix with stage-specific guidelines and weather precaution badges."),

        ("7.8 ALERTS MODULE",
         "Deliver proactive warnings regarding environmental and biological crop hazards.",
         "Continuously analyzes weather metrics and sensor thresholds to generate instant alerts for imminent fungal outbreaks, extreme heat waves, "
         "heavy rainfall waterlogging, and soil moisture depletion.",
         "Readable visual alert banners, notification badges, and actionable emergency precaution steps."),

        ("7.9 USER PROFILE MODULE",
         "Allow users to view, manage, and update their account credentials and farm preferences.",
         "Enables authenticated users to view registered account information (username, email, role, date joined) and update personal settings, "
         "farm location coordinates, and primary crop preferences.",
         "Updated user profile interface with saved farm settings and confirmation responses."),

        ("7.10 REPORT/PDF MODULE",
         "Generate comprehensive, printable bilingual PDF agronomy reports from platform data.",
         "Formats user diagnostic records, disease evaluation results, confidence bands, soil fertility metrics, water quality ratings, "
         "and organic/chemical treatments into a structured PDF document available in both English and Tamil.",
         "High-resolution digital and printable PDF agronomic report document."),

        ("7.11 BACKEND/API MODULE",
         "Provide secure, standardized RESTful API communication between frontends and backend services.",
         "Built on Django 5 and Django REST Framework. Handles HTTP routing, JSON serialization/deserialization, multipart image uploads, "
         "JWT authorization headers, database ORM transactions, and cross-origin resource sharing (CORS).",
         "Structured JSON responses with appropriate HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Error)."),

        ("7.12 AI/ML PREDICTION MODULE",
         "Process agricultural inputs (Leaf Images, Soil Chemistry, Water Quality) to generate predictive classifications.",
         "Executes trained AI/ML model inference pipelines: (1) MobileNetV2 CNN classifier targeting 38 leaf disease/healthy classes, "
         "(2) Scikit-Learn Random Forest/GBM model evaluating 12 soil parameters (N, P, K, pH, EC, micronutrients), and "
         "(3) Tabular model evaluating 14 irrigation water chemistry parameters (pH, EC, TDS, TH, Ca, Mg, etc.).",
         "Predicted disease/fertility/water quality labels, numerical confidence probabilities, and structured agronomic interpretation dictionaries."),

        ("7.13 VOICE / MICROPHONE INTERACTION MODULE",
         "Provide hands-free voice command capture, speech-to-text processing, and voice navigation.",
         "Integrates browser/native speech recognition to capture audio queries and commands via device microphone. "
         "Maps spoken phrases to navigation targets (Home, Dashboard, Analyzer, Soil, Water, Weather, Planner, Chatbot, Report) and triggers "
         "bilingual Text-to-Speech (TTS) audio feedback.",
         "Processed voice commands, real-time visual status toasts, spoken TTS confirmations, and automatic screen navigation.")
    ]

    for title, purpose, desc, out in modules:
        m_box = [
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('MTH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, textColor=PRIMARY))],
            [Paragraph(f"<b>Purpose:</b> {purpose}", ParagraphStyle('MTP', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=DARK_TEXT))],
            [Paragraph(f"<b>Description:</b> {desc}", ParagraphStyle('MTD', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=DARK_TEXT))],
            [Paragraph(f"<b>Output:</b> {out}", ParagraphStyle('MTO', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=SECONDARY))]
        ]
        t_mod = Table(m_box, colWidths=[485])
        t_mod.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('BOX', (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, 0), BOX_BG),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        story.append(t_mod)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # 08. SYSTEM ARCHITECTURE
    # =========================================================================
    story.append(SectionTracker("sec_08"))
    story.append(Paragraph("08. SYSTEM ARCHITECTURE", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "SmartCrop is architected as a decoupled, multi-tier client-server system designed for high availability, modular extensibility, "
        "and multi-platform responsiveness. The architectural layers are organized into Presentation, Application/API, AI Inference, Data Persistence, and External Services.",
        body_style
    ))

    arch_diagram_text = (
        "+-------------------------------------------------------------------------+\n"
        "|                        END USER (Farmer / Agronomist)                   |\n"
        "+------------------------------------+------------------------------------+\n"
        "                                     |\n"
        "            +------------------------+------------------------+\n"
        "            | (Touch / Text / Voice)                          | (Touch / Voice)\n"
        "            v                                                 v\n"
        "+-----------------------------+             +-----------------------------+\n"
        "|     REACT WEB / DESKTOP     |             |    FLUTTER MOBILE CLIENT    |\n"
        "|  (Vite + Web Speech API)    |             | (Dart + Camera + PDF Print) |\n"
        "+--------------+--------------+             +--------------+--------------+\n"
        "               |                                           |\n"
        "               +---------------------+---------------------+\n"
        "                                     | HTTPS / REST API (JSON)\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                     DJANGO REST BACKEND (Python 3.x)                    |\n"
        "|  - Authentication (JWT)      - Weather Processing Engine (Open-Meteo)   |\n"
        "|  - Prediction Controller     - Agronomy Advisory & Report Generator     |\n"
        "|  - Dashboard Analytics       - IoT Telemetry Ingestion & Pump Control   |\n"
        "+------------------+-----------------------------------+------------------+\n"
        "                   |                                   |\n"
        "       +-----------+-----------+           +-----------+-----------+\n"
        "       v                       v           v                       v\n"
        "+---------------+  +---------------+  +---------------+  +-----------------+\n"
        "| AI/ML VISION  |  | AI SOIL/WATER |  |  RELATIONAL   |  | EXTERNAL APIS   |\n"
        "|  MobileNetV2  |  |  ML Classifiers| |   DATABASE    |  |  Open-Meteo     |\n"
        "| (38 Classes)  |  | (Soil / Water)|  | (SQLite/Postg)|  |  Weather Service|\n"
        "+---------------+  +---------------+  +---------------+  +-----------------+\n"
        "       |                       |           |                       |\n"
        "       +-----------------------+-----+-----+-----------------------+\n"
        "                                     |\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "| RESULTS: Disease Diagnoses | Soil Fertility | Irrigation | Reports | Tasks |\n"
        "+-------------------------------------------------------------------------+"
    )

    t_arch = Table([[Paragraph(f"<pre>{arch_diagram_text}</pre>", code_style)]], colWidths=[485])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, SECONDARY),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(t_arch)

    story.append(Spacer(1, 4))
    story.append(Paragraph("Key Architectural Components:", h2_style))
    story.append(Paragraph("1. <b>Client Tier:</b> React desktop web client and Flutter mobile app providing uniform access to diagnostic tools, dashboards, and voice controls.", bullet_style))
    story.append(Paragraph("2. <b>Application Gateway Tier:</b> Django REST Framework routing endpoints, validating payloads, handling JWT tokens, and coordinating service modules.", bullet_style))
    story.append(Paragraph("3. <b>AI Inference Engine Tier:</b> MobileNetV2 CNN for foliar image classification and Scikit-Learn tabular models for soil/water chemistry evaluation.", bullet_style))
    story.append(Paragraph("4. <b>Data Persistence Tier:</b> Relational database storing authenticated users, disease records, soil/water logs, and reference treatments.", bullet_style))
    story.append(Paragraph("5. <b>IoT & Telemetry Subsystem:</b> Optional ESP32 sensor integration ingesting soil moisture, water level, and automated pump relay control.", bullet_style))

    # =========================================================================
    # 09. SYSTEM WORKFLOW
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_09"))
    story.append(Paragraph("09. SYSTEM WORKFLOW", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "The operational lifecycle of SmartCrop follows an intuitive, sequential 19-step workflow from initial user onboarding to comprehensive field reporting:",
        body_style
    ))

    steps_text = [
        "1. User accesses the SmartCrop platform via the React Web/Desktop client or Flutter Mobile application.",
        "2. User registers a new account or logs in with existing credentials to obtain a secure JWT authorization token.",
        "3. System validates credentials and redirects the user to the centralized SmartCrop Dashboard.",
        "4. User views dynamic farm summaries (total scans, healthy count, top diseases, and recent diagnoses).",
        "5. User selects the required feature (Crop Disease Prediction, Soil Analysis, Water Quality, Weather, Planner, Chatbot).",
        "6. Voice/microphone interaction may be activated to navigate or trigger tools hands-free in Tamil or English.",
        "7. For disease diagnosis, user captures or selects a leaf photograph with an optional crop type specification.",
        "8. Client packages the payload as multipart form-data and dispatches an authenticated HTTP POST request to Django backend.",
        "9. Django REST API validates image dimensions, checks mime-type, and forwards the file to the AI preprocessing pipeline.",
        "10. Preprocessing module resizes the image to 224x224 RGB, normalizes pixel arrays, and executes MobileNetV2 inference.",
        "11. AI model generates probability distribution across 38 classes, calculates confidence percentage, and extracts best match.",
        "12. Backend queries DiseaseInfo database to retrieve matched visible symptoms, organic remedies, and chemical dosages.",
        "13. Complete prediction record is saved to the user's historical database table.",
        "14. Backend returns structured JSON payload; frontend renders visual diagnosis, confidence badge, and treatment guide.",
        "15. User inspects Prediction History to review chronological diagnostic records and treatment effectiveness.",
        "16. User accesses Weather & Irrigation Module to receive 14-day forecasts and proactive fungal/heat risk indicators.",
        "17. User interacts with the AI Chatbot to ask natural language questions about crop diseases, watering, or fertilizers.",
        "18. User consults the 14-Day Farming Planner to execute stage-wise field tasks tailored to upcoming weather.",
        "19. User exports a printable, bilingual (English/Tamil) PDF agronomy report summarizing farm health and action items."
    ]

    for step in steps_text:
        story.append(Paragraph(f"• {step}", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # 10. USER INTERFACE DESCRIPTION
    # =========================================================================
    story.append(SectionTracker("sec_10"))
    story.append(Paragraph("10. USER INTERFACE DESCRIPTION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("10.1 Desktop/Web Interface (React + Vite)", h2_style))
    story.append(Paragraph(
        "The desktop/web application is designed with an immersive, nature-inspired modern aesthetic utilizing deep emerald tones (#0D1F0D, #1B341B), "
        "crisp typography (Outfit and Inter from Google Fonts), and responsive glassmorphism containers. Key interface modules include:",
        body_style
    ))
    story.append(Paragraph("• <b>Top Navigation Bar:</b> Provides brand identity, language toggle (English/Tamil), authenticated user badge, and quick navigation links.", bullet_style))
    story.append(Paragraph("• <b>Interactive Dashboard:</b> Features high-contrast metric stat cards, real-time health ratios, top disease breakdown charts, and quick-action shortcuts.", bullet_style))
    story.append(Paragraph("• <b>Predict Disease Studio:</b> Multi-tab analysis workspace supporting leaf image drag-and-drop, crop selection dropdowns, soil chemistry sliders, and water parameter forms.", bullet_style))
    story.append(Paragraph("• <b>Weather & Irrigation Hub:</b> Interactive 14-day forecast carousel, temperature trend lines, precipitation indicators, and color-coded risk alert chips.", bullet_style))
    story.append(Paragraph("• <b>AI Farming Chatbot:</b> Conversational messaging interface with live typing indicators, markdown formatting, contextual quick-reply buttons, and speech synthesis.", bullet_style))
    story.append(Paragraph("• <b>Floating Voice Navigation Button:</b> Persistent floating microphone button with radial pulsing animation during voice capture and real-time toast feedback.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("10.2 Flutter Mobile Interface", h2_style))
    story.append(Paragraph(
        "The Flutter mobile application adapts the core functionality and informational hierarchy of the desktop platform to touch-optimized, "
        "compact mobile viewports. Key mobile UI characteristics include:",
        body_style
    ))
    story.append(Paragraph("• <b>Mobile Navigation & Drawer:</b> Bottom navigation bar for rapid switching between Dashboard, Camera Diagnosis, Weather, and Chatbot.", bullet_style))
    story.append(Paragraph("• <b>Native Camera & Gallery Integration:</b> Leverages `image_picker` to capture high-resolution leaf photos directly in the field or pick from gallery albums.", bullet_style))
    story.append(Paragraph("• <b>Responsive Card Layouts:</b> Vertical scrollable cards presenting confidence meters, organic remedies, and chemical spray precautions.", bullet_style))
    story.append(Paragraph("• <b>On-Device PDF Generation:</b> Uses the `pdf` and `printing` packages to render printable reports directly on mobile devices without external dependencies.", bullet_style))
    story.append(Paragraph("• <b>Touch & Accessibility Optimization:</b> Large touch targets, high-contrast text, and simple voice triggers ensuring usability under direct sunlight.", bullet_style))

    # =========================================================================
    # 11. DATABASE / DATA MANAGEMENT
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_11"))
    story.append(Paragraph("11. DATABASE / DATA MANAGEMENT", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "SmartCrop utilizes Django's Object-Relational Mapping (ORM) layer connected to a relational database (SQLite for development and PostgreSQL for production). "
        "The relational schema enforces data integrity, foreign key constraints, and efficient query indexing across core entities:",
        body_style
    ))

    db_data = [
        [Paragraph("<b>Model / Table</b>", table_header_style), Paragraph("<b>Key Attributes & Fields</b>", table_header_style), Paragraph("<b>Functional Role in SmartCrop</b>", table_header_style)],
        [Paragraph("CustomUser (users)", table_cell_style), Paragraph("id, username, email, password, role, first_name, last_name, date_joined", table_cell_style), Paragraph("User account credentials, authentication, and permission management", table_cell_style)],
        [Paragraph("Crop (crop)", table_cell_style), Paragraph("id, name, scientific_name, description, image", table_cell_style), Paragraph("Catalog of supported agricultural crops and botanical data", table_cell_style)],
        [Paragraph("DiseaseInfo (disease)", table_cell_style), Paragraph("id, disease_key, crop_name, disease_name, severity, symptoms, description, organic_treatment, organic_dosage, chemical_treatment, chemical_dosage, is_healthy", table_cell_style), Paragraph("Curated knowledge base linking AI model classes to actionable agronomic advice", table_cell_style)],
        [Paragraph("DiseasePrediction (disease)", table_cell_style), Paragraph("id, user_id (FK), image, crop_name, predicted_disease, disease_key, confidence, treatment_advice, is_healthy, created_at", table_cell_style), Paragraph("Permanent log of farmer disease predictions, uploaded leaf media, and confidence scores", table_cell_style)],
        [Paragraph("SoilAnalysisRecord (advisor)", table_cell_style), Paragraph("id, user_id (FK), N, P, K, pH, EC, OC, S, Zn, Fe, Cu, Mn, B, predicted_class, confidence, created_at", table_cell_style), Paragraph("Historical log of soil chemistry inputs, AI fertility classifications, and amendments", table_cell_style)],
        [Paragraph("WaterAnalysisRecord (advisor)", table_cell_style), Paragraph("id, user_id (FK), pH, EC, TDS, TH, Ca, Mg, Na, K, Cl, SO4, NO3, suitability_status, created_at", table_cell_style), Paragraph("Historical log of water quality readings and crop irrigation suitability ratings", table_cell_style)],
        [Paragraph("SensorData (iot_sensor)", table_cell_style), Paragraph("id, device_id, soil_moisture, water_level, temperature, humidity, pump_status, pump_mode, timestamp", table_cell_style), Paragraph("Time-series sensor telemetry data from ESP32 nodes and automated pump relay decisions", table_cell_style)],
    ]
    t_db = Table(db_data, colWidths=[115, 195, 175])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_db)

    # =========================================================================
    # 12. API COMMUNICATION
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_12"))
    story.append(Paragraph("12. API COMMUNICATION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "Communication between the frontend clients and the backend services is strictly mediated via standard HTTP/HTTPS REST endpoints formatted in JSON. "
        "Endpoints are organized modularly across Django apps:",
        body_style
    ))

    api_data = [
        [Paragraph("<b>Endpoint Route</b>", table_header_style), Paragraph("<b>Method</b>", table_header_style), Paragraph("<b>Auth Required</b>", table_header_style), Paragraph("<b>Payload / Output Description</b>", table_header_style)],
        [Paragraph("/api/auth/token/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Takes username/password; returns JWT access and refresh tokens", table_cell_style)],
        [Paragraph("/api/auth/register/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Registers new user account; returns user profile and auth tokens", table_cell_style)],
        [Paragraph("/api/dashboard/stats/", table_cell_style), Paragraph("GET", table_cell_center), Paragraph("Yes (JWT)", table_cell_center), Paragraph("Returns total scans, healthy count, top diseases, and recent prediction list", table_cell_style)],
        [Paragraph("/api/disease/predict/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("AllowAny", table_cell_center), Paragraph("Uploads leaf image; returns AI disease prediction, confidence, and remedies", table_cell_style)],
        [Paragraph("/api/disease/history/", table_cell_style), Paragraph("GET", table_cell_center), Paragraph("Yes (JWT)", table_cell_center), Paragraph("Returns paginated list of previous disease predictions for the user", table_cell_style)],
        [Paragraph("/api/disease/info/", table_cell_style), Paragraph("GET", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Returns curated disease knowledge base filtered by optional crop param", table_cell_style)],
        [Paragraph("/api/weather/forecast/", table_cell_style), Paragraph("GET", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Query params: lat, lon; returns 14-day weather statistics & farming risks", table_cell_style)],
        [Paragraph("/api/weather/planner/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Body: lat, lon, crop, stage; returns 14-day daily farming action plan", table_cell_style)],
        [Paragraph("/api/chatbot/message/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("Yes (JWT)", table_cell_center), Paragraph("Body: message, context; returns chatbot response and quick suggestions", table_cell_style)],
        [Paragraph("/api/advisor/soil/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Body: N, P, K, pH, etc.; returns soil fertility classification & organic advice", table_cell_style)],
        [Paragraph("/api/advisor/water/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Body: pH, EC, TDS, etc.; returns water quality rating & irrigation suitability", table_cell_style)],
        [Paragraph("/api/advisor/report/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("Yes (JWT)", table_cell_center), Paragraph("Body: lang, prediction_id; returns structured multilingual report data", table_cell_style)],
        [Paragraph("/api/sensor-data/", table_cell_style), Paragraph("POST", table_cell_center), Paragraph("No", table_cell_center), Paragraph("Ingests live telemetry from ESP32; returns automated pump decision", table_cell_style)],
    ]
    t_api = Table(api_data, colWidths=[120, 45, 65, 255])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_api)

    story.append(PageBreak())

    # =========================================================================
    # 13. TESTING
    # =========================================================================
    story.append(SectionTracker("sec_13"))
    story.append(Paragraph("13. SYSTEM TESTING AND VERIFICATION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph(
        "Systematic verification of SmartCrop was conducted across backend API endpoints, AI inference pipelines, web desktop components, "
        "and Flutter mobile modules. Verified functionalities are marked as <b>Pass</b>, while items requiring future hardware/cloud deployment are marked as <b>To Be Verified</b>.",
        body_style
    ))

    test_data = [
        [Paragraph("<b>Test Case</b>", table_header_style), Paragraph("<b>Input / Action</b>", table_header_style), Paragraph("<b>Expected Result</b>", table_header_style), Paragraph("<b>Actual Result</b>", table_header_style), Paragraph("<b>Status</b>", table_header_style)],
        [Paragraph("TC-01: User Registration", table_cell_style), Paragraph("Submit valid username, email, password", table_cell_style), Paragraph("Account created; JWT tokens returned", table_cell_style), Paragraph("User registered; tokens received", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-02: User Login", table_cell_style), Paragraph("Enter valid credentials on login page", table_cell_style), Paragraph("JWT token issued; redirect to Dashboard", table_cell_style), Paragraph("Successful login and redirect", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-03: Dashboard Stats", table_cell_style), Paragraph("Fetch /api/dashboard/stats/ with JWT", table_cell_style), Paragraph("Return scan counts and disease metrics", table_cell_style), Paragraph("Summary statistics rendered accurately", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-04: Foliar Prediction", table_cell_style), Paragraph("Upload tomato early blight leaf image", table_cell_style), Paragraph("Identify disease with confidence & remedy", table_cell_style), Paragraph("Detected Tomato Early Blight (>85%)", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-05: Lead / Crop Input", table_cell_style), Paragraph("Select crop filter 'Tomato' with image", table_cell_style), Paragraph("Constrain class matching to Tomato diseases", table_cell_style), Paragraph("Filtered inference successfully applied", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-06: Soil Analysis Input", table_cell_style), Paragraph("Submit N, P, K, pH, and micronutrients", table_cell_style), Paragraph("Return soil fertility grade & fertilizer tips", table_cell_style), Paragraph("Fertility grade & organic tips generated", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-07: Water Quality Input", table_cell_style), Paragraph("Submit pH, EC, TDS, and mineral values", table_cell_style), Paragraph("Return water quality status & irrigation risks", table_cell_style), Paragraph("Irrigation suitability report returned", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-08: Prediction History", table_cell_style), Paragraph("Navigate to prediction history page", table_cell_style), Paragraph("Load user's historical diagnosis cards", table_cell_style), Paragraph("Historical records listed chronologically", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-09: Weather Forecast", table_cell_style), Paragraph("Query Open-Meteo with valid lat/lon", table_cell_style), Paragraph("Return 14-day daily weather & agro risks", table_cell_style), Paragraph("14-day forecast rendered with risk badges", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-10: Irrigation Advice", table_cell_style), Paragraph("Process rain probability & temperature", table_cell_style), Paragraph("Generate skip or irrigate recommendation", table_cell_style), Paragraph("Accurate recommendation generated", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-11: Chatbot Queries", table_cell_style), Paragraph("Send query: 'Why are leaves yellowing?'", table_cell_style), Paragraph("Return contextual diagnostic causes & tips", table_cell_style), Paragraph("Relevant nutrient & virus causes returned", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-12: Voice Interaction", table_cell_style), Paragraph("Speak command: 'Open Dashboard' / 'மண்'", table_cell_style), Paragraph("Recognize command and navigate to page", table_cell_style), Paragraph("Voice parsed and screen transitioned", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-13: Farming Planner", table_cell_style), Paragraph("Select Tomato + Vegetative Stage", table_cell_style), Paragraph("Generate 14-day weather-based task plan", table_cell_style), Paragraph("14-day customized task table generated", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-14: User Profile Edit", table_cell_style), Paragraph("Update profile coordinates and role", table_cell_style), Paragraph("Profile updated in database", table_cell_style), Paragraph("Profile details updated successfully", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-15: Environmental Alerts", table_cell_style), Paragraph("Simulate high humidity + rainy forecast", table_cell_style), Paragraph("Trigger high fungal disease risk alert", table_cell_style), Paragraph("High fungal risk alert banner displayed", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-16: PDF Report Generator", table_cell_style), Paragraph("Click 'Generate Report' in English/Tamil", table_cell_style), Paragraph("Generate downloadable/printable PDF", table_cell_style), Paragraph("Bilingual PDF formatted & downloaded", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-17: Backend Connectivity", table_cell_style), Paragraph("Execute test suite against Django API", table_cell_style), Paragraph("All endpoints respond with HTTP 200/201", table_cell_style), Paragraph("Test suite passed across all routes", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-18: Mobile Camera Flow", table_cell_style), Paragraph("Capture leaf on Android device", table_cell_style), Paragraph("Upload image and render diagnosis", table_cell_style), Paragraph("Leaf uploaded and diagnosed on mobile", table_cell_style), Paragraph("Pass", table_cell_center)],
        [Paragraph("TC-19: IoT Live Hardware", table_cell_style), Paragraph("ESP32 telemetry transmission in field", table_cell_style), Paragraph("Automated relay triggers physical pump", table_cell_style), Paragraph("Simulated via Wokwi / API endpoints", table_cell_style), Paragraph("To Be Verified", table_cell_center)],
        [Paragraph("TC-20: Cloud Production", table_cell_style), Paragraph("Deploy to cloud container environment", table_cell_style), Paragraph("Global multi-user concurrent scaling", table_cell_style), Paragraph("Docker configurations prepared", table_cell_style), Paragraph("To Be Verified", table_cell_center)],
    ]

    t_test = Table(test_data, colWidths=[95, 95, 115, 115, 65])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_test)

    # =========================================================================
    # 14. ADVANTAGES AND LIMITATIONS
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_14"))
    story.append(Paragraph("14. ADVANTAGES AND LIMITATIONS", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("14.1 Advantages", h2_style))
    story.append(Paragraph("• <b>Comprehensive Agronomic Suite:</b> Combines disease vision diagnosis, soil chemistry testing, water quality classification, and weather intelligence into one platform.", bullet_style))
    story.append(Paragraph("• <b>Dual Treatment Guidance:</b> Provides organic/biological remediation recipes alongside approved chemical treatment schedules to suit diverse farming philosophies.", bullet_style))
    story.append(Paragraph("• <b>Accessibility & Language Inclusivity:</b> Delivers complete bilingual support (English and Tamil) and voice/microphone navigation for non-technical users.", bullet_style))
    story.append(Paragraph("• <b>Synchronized Multi-Device Experience:</b> Seamless continuity between desktop web browsers and native Android/iOS mobile applications.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("14.2 Limitations", h2_style))
    story.append(Paragraph("• <b>Dependence on Internet Connectivity:</b> Live AI inference, meteorological updates, and API communications require active network connections.", bullet_style))
    story.append(Paragraph("• <b>Image Quality Sensitivity:</b> AI disease prediction accuracy is sensitive to blurry, poorly lit, or out-of-focus leaf photographs.", bullet_style))
    story.append(Paragraph("• <b>Class Coverage Constraints:</b> Machine learning disease models are bounded by the 38 trained plant-pathology classes from the benchmark dataset.", bullet_style))
    story.append(Paragraph("• <b>Browser Speech Dependency:</b> Voice recognition functionality relies on the client device's browser/OS supporting the Web Speech API standards.", bullet_style))

    # =========================================================================
    # 15. FUTURE ENHANCEMENTS
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(SectionTracker("sec_15"))
    story.append(Paragraph("15. FUTURE ENHANCEMENTS", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    story.append(Paragraph("• <b>Edge AI & On-Device Offline Inference:</b> Quantize deep learning models into TensorFlow Lite (TFLite) to enable offline crop disease prediction directly on mobile devices without internet.", bullet_style))
    story.append(Paragraph("• <b>Expanded Regional Languages & Dialects:</b> Extend speech recognition and UI localization to additional languages (Hindi, Telugu, Kannada, Malayalam).", bullet_style))
    story.append(Paragraph("• <b>IoT Sensor Mesh Integration:</b> Deploy low-power LoRaWAN sensor networks for automated soil moisture, NPK probes, and autonomous solar pump triggering.", bullet_style))
    story.append(Paragraph("• <b>Satellite & Drone Spectral Imagery:</b> Integrate multispectral Normalized Difference Vegetation Index (NDVI) satellite imagery for field-wide canopy health monitoring.", bullet_style))
    story.append(Paragraph("• <b>Marketplace & Extension Officer Tele-Consultation:</b> Implement direct video/chat tele-consultation connecting farmers with verified agricultural university extension specialists.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # 16. CONCLUSION
    # =========================================================================
    story.append(SectionTracker("sec_16"))
    story.append(Paragraph("16. CONCLUSION", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    conclusion_text = (
        "The <b>SmartCrop: AI-Based Crop Disease Prediction and Smart Farming Assistant</b> project successfully demonstrates the design, "
        "development, and integration of a modern smart agricultural software platform. Developed for academic submission in the Department of Computer Science "
        "at Sacred Heart College (Autonomous), Tirupattur, the system unites state-of-the-art computer vision models, tabular machine learning algorithms, "
        "real-time meteorological APIs, and cross-platform mobile/web clients into a cohesive ecosystem.<br/><br/>"
        "By automating foliar disease identification across 38 crop-pathology categories, analyzing soil fertility and water quality, delivering 14-day weather "
        "risk evaluations, supporting voice-driven navigation in English and Tamil, and generating printable bilingual agronomic reports, SmartCrop addresses the core "
        "operational and informational challenges faced by modern farmers. The decoupled architectural design ensures high performance, maintainability, and ready "
        "extensibility for future edge computing and IoT hardware integrations. SmartCrop stands as a practical, technologically grounded contribution toward "
        "bridging the digital divide in precision agriculture."
    )
    story.append(Paragraph(conclusion_text, body_style))

    # =========================================================================
    # 17. REFERENCES
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(SectionTracker("sec_17"))
    story.append(Paragraph("17. REFERENCES", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=PRIMARY, spaceAfter=6, spaceBefore=1))

    references_list = [
        "[1] Django Software Foundation, 'Django: The Web framework for perfectionists with deadlines', Official Documentation, https://docs.djangoproject.com/, 2024.",
        "[2] Django REST Framework, 'REST APIs for Django', Encode OSS, https://www.django-rest-framework.org/, 2024.",
        "[3] Google LLC, 'Flutter: Build apps for any screen', Flutter Framework Documentation, https://docs.flutter.dev/, 2024.",
        "[4] Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L. C., 'MobileNetV2: Inverted Residuals and Linear Bottlenecks', IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2018.",
        "[5] Hughes, D. P., & Salathé, M., 'An open access repository of images on plant health to enable the development of mobile disease diagnostics', PlantVillage Dataset Repository, arXiv:1511.08060, 2015.",
        "[6] Pedregosa, F., et al., 'Scikit-learn: Machine Learning in Python', Journal of Machine Learning Research (JMLR), Vol. 12, pp. 2825–2830, 2011.",
        "[7] Open-Meteo, 'Open-Meteo Weather Forecast API: Open-Source Weather API for Non-Commercial and Research Use', https://open-meteo.com/, 2024.",
        "[8] W3C Web Speech Working Group, 'Web Speech API Specification', World Wide Web Consortium (W3C), https://www.w3.org/TR/speech-api/, 2023.",
        "[9] Firebase Documentation, 'Firebase Core & Cross-Platform Mobile Services', Google LLC, https://firebase.google.com/docs, 2024.",
        "[10] ReportLab Inc., 'ReportLab PDF Generation User Guide & Technical Manual', https://docs.reportlab.com/, 2024."
    ]

    for ref in references_list:
        story.append(Paragraph(ref, ParagraphStyle('RefStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=DARK_TEXT, spaceAfter=3.5)))

    return story


def build_two_pass_pdf(filename="SmartCrop_Academic_Project_Documentation_Report.pdf"):
    styles = getSampleStyleSheet()

    # Pass 1: Build dummy document to populate SECTION_PAGES
    temp_doc = SimpleDocTemplate(
        "temp_pass1.pdf",
        pagesize=A4, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54
    )
    story1 = generate_story(styles, toc_page_map=None)
    temp_doc.build(story1, canvasmaker=NumberedCanvas)

    print(f"Pass 1 Completed. Recorded section pages: {SECTION_PAGES}")

    # Pass 2: Build final document with exact TOC page numbers
    final_doc = SimpleDocTemplate(
        filename,
        pagesize=A4, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54
    )
    story2 = generate_story(styles, toc_page_map=SECTION_PAGES)
    final_doc.build(story2, canvasmaker=NumberedCanvas)

    if os.path.exists("temp_pass1.pdf"):
        try:
            os.remove("temp_pass1.pdf")
        except Exception:
            pass

    print(f"Final Academic PDF Documentation successfully generated: {filename}")


if __name__ == '__main__':
    output_path = os.path.join(os.getcwd(), "SmartCrop_Academic_Project_Documentation_Report.pdf")
    build_two_pass_pdf(output_path)
