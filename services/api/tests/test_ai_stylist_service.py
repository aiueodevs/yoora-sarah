from __future__ import annotations

import base64
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import requests
from pydantic import ValidationError

from app.api.v1.endpoints.ai_stylist import ChatRequest
from app.services.ai_stylist_service import ai_stylist_service
from app.services.catalog_store import catalog_store


class AiStylistServiceTest(unittest.TestCase):
    def test_chat_history_changes_response_context(self) -> None:
        without_history = ai_stylist_service.build_chat_response(
            message="Buatkan outfit formal untuk kantor",
            history=[],
        )
        with_history = ai_stylist_service.build_chat_response(
            message="Buatkan outfit formal untuk kantor",
            history=[{"role": "user", "content": "Saya suka warna hitam"}],
        )

        self.assertNotEqual(without_history["content"], with_history["content"])
        self.assertIn("preferensi dari sesi sebelumnya", with_history["content"])

    def test_chat_request_rejects_oversized_image(self) -> None:
        oversized_bytes = b"x" * (5 * 1024 * 1024 + 1)
        oversized_image = "data:image/png;base64," + base64.b64encode(oversized_bytes).decode("ascii")

        with self.assertRaises(ValidationError):
            ChatRequest.model_validate(
                {
                    "message": "tolong cek gambar ini",
                    "image": oversized_image,
                }
            )

    def test_product_to_model_falls_back_to_mock_when_provider_fails(self) -> None:
        product = catalog_store.list_product_details("dress")[0]
        settings_stub = SimpleNamespace(stylist_product_to_model_provider="gemini")

        with (
            patch("app.services.ai_stylist_service.get_settings", return_value=settings_stub),
            patch.object(
                ai_stylist_service,
                "_submit_gemini_product_to_model",
                side_effect=requests.RequestException("quota exceeded"),
            ),
        ):
            result = ai_stylist_service.create_product_to_model(
                category_slug=product.category_slug,
                product_slug=product.slug,
            )

        self.assertEqual(result.status, "succeeded")
        self.assertEqual(result.provider, "mock")
        self.assertIn("fallbackProvider", result.metadata)


if __name__ == "__main__":
    unittest.main()
