from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.catalog import (
    CatalogCategory,
    CatalogProductDetail,
    CatalogProductSummary,
    StorefrontCatalogPayload,
)
from app.services.catalog_store import catalog_store, yoora_api_sync

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/storefront", response_model=StorefrontCatalogPayload)
async def get_storefront_catalog() -> StorefrontCatalogPayload:
    return catalog_store.get_storefront_catalog()


@router.get("/categories", response_model=list[CatalogCategory])
async def list_catalog_categories() -> list[CatalogCategory]:
    return catalog_store.list_categories()


@router.get("/products", response_model=list[CatalogProductSummary])
async def list_catalog_products(
    category: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    limit: int = Query(default=24, ge=1, le=100),
) -> list[CatalogProductSummary]:
    return catalog_store.list_product_summaries(
        category_slug=category,
        featured_only=featured,
        limit=limit,
    )


@router.get(
    "/products/{category_slug}/{product_slug}", response_model=CatalogProductDetail
)
async def get_catalog_product(
    category_slug: str,
    product_slug: str,
) -> CatalogProductDetail:
    product = catalog_store.get_product_detail(category_slug, product_slug)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catalog product not found.",
        )

    return product


@router.post("/sync")
async def sync_from_api() -> dict:
    """Sync semua produk dari API Yoora Sarah."""
    products = await yoora_api_sync.list_all_products()
    transformed = [yoora_api_sync.transform_product(p) for p in products]
    return {
        "status": "success",
        "total_products": len(transformed),
        "categories_found": len(set(p.category_slug for p in transformed)),
    }


@router.get("/sync/products/{category_slug}", response_model=list[CatalogProductDetail])
async def sync_products_by_category(category_slug: str) -> list[CatalogProductDetail]:
    """Fetch dan transform produk dari API berdasarkan kategori."""
    products = await yoora_api_sync.list_products_by_category(category_slug)
    return [yoora_api_sync.transform_product(p) for p in products]
