from __future__ import annotations

from dataclasses import dataclass
from app.services.catalog_store import catalog_store
from app.schemas.catalog import CatalogProductDetail


@dataclass
class OutfitMatch:
    dress: CatalogProductDetail | None
    hijab: CatalogProductDetail | None
    accessories: list[CatalogProductDetail]
    total_price: int
    styling_notes: list[str]


class ColorMatcher:
    COLOR_CATEGORIES = {
        "neutral": ["black", "white", "broken white", "cream"],
        "earth": ["cappucino", "camel", "hazelnut", "caramel", "bitter coklat"],
        "soft": ["rose taupe", "chinderose", "blush", "mauve"],
        "bold": ["dark maroon", "dark teal", "sea storm", "charcoal"],
    }

    @classmethod
    def get_color_category(cls, color_name: str) -> str:
        color_lower = color_name.lower()
        for category, colors in cls.COLOR_CATEGORIES.items():
            if any(c in color_lower for c in colors):
                return category
        return "neutral"

    @classmethod
    def are_compatible(cls, color1: str, color2: str) -> bool:
        cat1 = cls.get_color_category(color1)
        cat2 = cls.get_color_category(color2)
        if cat1 == cat2:
            return True
        if cat1 == "neutral" or cat2 == "neutral":
            return True
        return False


class OutfitMatcher:
    def __init__(self):
        self.catalog = catalog_store

    def find_matching_hijab(
        self, dress: CatalogProductDetail, limit: int = 5
    ) -> list[CatalogProductDetail]:
        hijab_categories = ["hijab-1544", "pashmina-2310", "khimar-5295"]
        candidates = []

        all_products = self.catalog.list_product_details()
        for product in all_products:
            if product.category_slug not in hijab_categories:
                continue
            if product.stock_state == "out_of_stock":
                continue

            score = 0
            if dress.colors and product.colors:
                for dc in dress.colors:
                    for pc in product.colors:
                        if ColorMatcher.are_compatible(dc.name, pc.name):
                            score += 5
                            break

            if abs(product.price - dress.price) <= 100000:
                score += 2
            if product.stock_state == "in_stock":
                score += 3

            candidates.append((score, product))

        candidates.sort(key=lambda x: -x[0])
        return [c[1] for c in candidates[:limit]]

    def find_accessories(
        self, dress: CatalogProductDetail, limit: int = 3
    ) -> list[CatalogProductDetail]:
        acc_categories = ["accessories-4472"]
        candidates = []

        all_products = self.catalog.list_product_details()
        for product in all_products:
            if product.category_slug not in acc_categories:
                continue
            if product.stock_state == "out_of_stock":
                continue

            score = 0
            if product.price <= dress.price * 0.3:
                score += 2
            if product.stock_state == "in_stock":
                score += 1

            candidates.append((score, product))

        candidates.sort(key=lambda x: -x[0])
        return [c[1] for c in candidates[:limit]]

    def create_outfit(
        self, dress: CatalogProductDetail, occasion: str | None = None
    ) -> OutfitMatch:
        hijab = self.find_matching_hijab(dress, limit=1)
        accessories = self.find_accessories(dress, limit=2)

        total_price = dress.price
        if hijab:
            total_price += hijab[0].price
        for acc in accessories:
            total_price += acc.price

        styling_notes = [
            f"Pilihan utama: {dress.name} dengan harga Rp {dress.price:,}",
        ]
        if hijab:
            styling_notes.append(
                f"Tambahkan {hijab[0].name} (Rp {hijab[0].price:,}) untuk tampilan yang lebih lengkap"
            )
        if accessories:
            acc_names = ", ".join([a.name for a in accessories])
            styling_notes.append(f"Aksesori: {acc_names}")
        styling_notes.append(f"Total outfit: Rp {total_price:,}")

        return OutfitMatch(
            dress=dress,
            hijab=hijab[0] if hijab else None,
            accessories=accessories,
            total_price=total_price,
            styling_notes=styling_notes,
        )


ai_stylist_service = OutfitMatcher()
