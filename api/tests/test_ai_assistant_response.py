import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.ai_tools_service import AIToolsService


def test_sensitive_query_returns_whatsapp_action():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "Saya kecewa dan ingin komplain soal pesanan saya",
        {
            "flags": {
                "is_sensitive": True,
                "is_size_query": False,
                "is_styling_query": False,
                "is_product_query": False,
            },
            "handoff": {
                "summary": "Kasus ini lebih aman ditangani support.",
                "nextAction": "Lanjutkan ke WhatsApp support untuk penanganan manual.",
                "contact": {"whatsappHref": "https://wa.me/6282315866088?text=test"},
            },
            "order_status": {},
            "size_guidance": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )

    assert response.actions is not None
    assert response.actions[0].kind == "whatsapp"
    assert response.actions[0].href.startswith("https://wa.me/")


def test_size_handoff_returns_whatsapp_action():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "Ukuran M saya tidak tersedia, sebaiknya apa?",
        {
            "flags": {
                "is_sensitive": False,
                "is_size_query": True,
                "is_styling_query": False,
                "is_product_query": False,
            },
            "handoff": {
                "nextAction": "Lanjutkan ke WhatsApp support untuk konfirmasi ukuran.",
                "contact": {"whatsappHref": "https://wa.me/6282315866088?text=size-help"},
            },
            "size_guidance": {
                "found": True,
                "message": "Rekomendasi awal ukuran L.",
                "fit_summary": "Ukuran L lebih aman untuk ruang gerak.",
                "measurement_note": "Pilihan ukuran tersedia: S, M, L.",
                "alternative_sizes": ["L"],
                "handoff_recommended": True,
            },
            "order_status": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )

    assert response.actions is not None
    assert response.actions[0].label == "Chat CS via WhatsApp"


def test_general_greeting_uses_yoora_concierge_tone():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "halo",
        {
            "flags": {
                "is_sensitive": False,
                "is_size_query": False,
                "is_styling_query": False,
                "is_product_query": False,
            },
            "handoff": {},
            "order_status": {},
            "size_guidance": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )

    assert "Yoora Sarah" in response.content
