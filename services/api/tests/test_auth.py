"""Tests for internal API authentication dependencies."""
from __future__ import annotations

import os
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.api.dependencies.auth import require_internal_actor, require_roles


class TestRequireInternalActor:
    """Test require_internal_actor dependency."""

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_missing_secret_rejects_by_default(self, mock_store, mock_settings):
        """Without ALLOW_INSECURE_AUTH, missing secret should fail closed."""
        mock_settings.return_value.internal_api_shared_secret = ""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(HTTPException) as exc:
                require_internal_actor(internal_key=None, actor_email=None)
            assert exc.value.status_code == 503

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_insecure_dev_mode_allowed_when_opted_in(self, mock_store, mock_settings):
        """With ALLOW_INSECURE_AUTH=true, missing secret returns insecure-dev actor."""
        mock_settings.return_value.internal_api_shared_secret = ""
        mock_store.find_user_id_by_email.return_value = None
        with patch.dict(os.environ, {"ALLOW_INSECURE_AUTH": "true"}):
            actor = require_internal_actor(internal_key=None, actor_email="dev@test.com")
            assert actor.auth_mode == "insecure-dev"
            assert actor.email == "dev@test.com"

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_wrong_key_rejected(self, mock_store, mock_settings):
        """Invalid API key should return 401."""
        mock_settings.return_value.internal_api_shared_secret = "correct-secret"
        with pytest.raises(HTTPException) as exc:
            require_internal_actor(internal_key="wrong-key", actor_email="user@test.com")
        assert exc.value.status_code == 401

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_missing_email_rejected(self, mock_store, mock_settings):
        """Valid key but missing email should return 401."""
        mock_settings.return_value.internal_api_shared_secret = "correct-secret"
        with pytest.raises(HTTPException) as exc:
            require_internal_actor(internal_key="correct-secret", actor_email=None)
        assert exc.value.status_code == 401

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_valid_auth_returns_enforced_actor(self, mock_store, mock_settings):
        """Valid key + email with roles should return enforced actor."""
        mock_settings.return_value.internal_api_shared_secret = "correct-secret"
        mock_store.find_user_id_by_email.return_value = 42
        mock_store.list_user_roles.return_value = ["owner"]
        actor = require_internal_actor(
            internal_key="correct-secret",
            actor_email="admin@yoora.co",
        )
        assert actor.auth_mode == "enforced"
        assert actor.email == "admin@yoora.co"
        assert "owner" in actor.roles
        assert actor.user_id == 42

    @patch("app.api.dependencies.auth.get_settings")
    @patch("app.api.dependencies.auth.store")
    def test_no_roles_rejected(self, mock_store, mock_settings):
        """Valid key + email but no roles should return 403."""
        mock_settings.return_value.internal_api_shared_secret = "correct-secret"
        mock_store.find_user_id_by_email.return_value = 1
        mock_store.list_user_roles.return_value = []
        with pytest.raises(HTTPException) as exc:
            require_internal_actor(
                internal_key="correct-secret",
                actor_email="nobody@yoora.co",
            )
        assert exc.value.status_code == 403
