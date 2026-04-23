from pydantic import BaseModel, ConfigDict, Field


class CatalogSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class CatalogCategory(CatalogSchema):
    id: str
    slug: str
    name: str
    description: str
    hero_image: str = Field(serialization_alias="heroImage")
    eyebrow: str | None = None


class CatalogFeaturedStory(CatalogSchema):
    title: str
    subtitle: str
    thumbnail: str
    href: str


class CatalogProductColor(CatalogSchema):
    name: str
    hex: str
    gallery: list[str]


class CatalogProductSummary(CatalogSchema):
    id: str
    category_slug: str = Field(serialization_alias="categorySlug")
    name: str
    slug: str
    price: int
    compare_price: int | None = Field(default=None, serialization_alias="comparePrice")
    image: str
    swatch_count: int = Field(serialization_alias="swatchCount")
    sizes: list[str]
    badge: str | None = None
    stock: int
    stock_state: str | None = Field(default=None, serialization_alias="stockState")
    is_featured: bool | None = Field(default=None, serialization_alias="isFeatured")
    tags: list[str] | None = None


class CatalogProductDetail(CatalogProductSummary):
    colors: list[CatalogProductColor]
    description: list[str]
    materials: list[str]
    care: list[str]
    trust_badges: list[str] | None = Field(
        default=None, serialization_alias="trustBadges"
    )
    compare_price: int | None = Field(default=None, serialization_alias="comparePrice")


class CatalogLink(CatalogSchema):
    label: str
    href: str


class StorefrontFooterData(CatalogSchema):
    company: str
    address: str
    phone: str
    shopping_help: list[CatalogLink] = Field(serialization_alias="shoppingHelp")
    about: list[CatalogLink]
    policy: list[CatalogLink]
    social: list[CatalogLink]


class StorefrontQuickLink(CatalogSchema):
    eyebrow: str
    title: str
    description: str
    href: str


class StorefrontAccountHighlight(CatalogSchema):
    label: str
    value: str
    description: str


class StorefrontCatalogPayload(CatalogSchema):
    categories: list[CatalogCategory]
    featured_stories: list[CatalogFeaturedStory] = Field(
        serialization_alias="featuredStories"
    )
    products: list[CatalogProductDetail]
    search_prompts: list[str] = Field(serialization_alias="searchPrompts")
    utility_quick_links: list[StorefrontQuickLink] = Field(
        serialization_alias="utilityQuickLinks"
    )
    account_highlights: list[StorefrontAccountHighlight] = Field(
        serialization_alias="accountHighlights"
    )
    checkout_steps: list[str] = Field(serialization_alias="checkoutSteps")
    trust_signals: list[str] = Field(serialization_alias="trustSignals")
    footer: StorefrontFooterData
