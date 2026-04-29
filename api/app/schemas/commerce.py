from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalog import (
    CatalogProductDetail,
    StorefrontAccountHighlight,
    StorefrontQuickLink,
)

OrderStatus = Literal["awaiting_payment", "processing", "ready_to_ship", "shipped", "delivered"]
CustomerMemberState = Literal["guest", "member_active", "member_priority"]
SupportTopic = Literal["payment", "shipping", "preorder", "size", "returns", "order_status"]
SupportSource = Literal["checkout", "order_tracking", "buyer_ai", "profile"]
CartStatus = Literal["active", "converted", "abandoned"]


class CommerceSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class StorefrontCartItem(CommerceSchema):
    id: str
    category_slug: str = Field(serialization_alias="categorySlug")
    product_slug: str = Field(serialization_alias="productSlug")
    name: str
    price: int
    image: str
    quantity: int
    color: str
    size: str


class CustomerAddress(CommerceSchema):
    id: str
    label: str
    recipient_name: str = Field(serialization_alias="recipientName")
    phone: str
    line1: str
    city: str
    province: str
    postal_code: str = Field(serialization_alias="postalCode")
    is_primary: bool = Field(serialization_alias="isPrimary")


class OrderSummary(CommerceSchema):
    id: str
    order_number: str = Field(serialization_alias="orderNumber")
    status: OrderStatus
    status_label: str = Field(serialization_alias="statusLabel")
    total: int
    item_count: int = Field(serialization_alias="itemCount")
    placed_at: str = Field(serialization_alias="placedAt")


class CustomerProfilePayload(CommerceSchema):
    customer_id: str = Field(serialization_alias="customerId")
    full_name: str = Field(serialization_alias="fullName")
    phone: str
    member_state: CustomerMemberState = Field(serialization_alias="memberState")
    account_highlights: list[StorefrontAccountHighlight] = Field(serialization_alias="accountHighlights")
    utility_quick_links: list[StorefrontQuickLink] = Field(serialization_alias="utilityQuickLinks")
    wishlist_preview: list[CatalogProductDetail] = Field(serialization_alias="wishlistPreview")
    addresses: list[CustomerAddress]
    recent_orders: list[OrderSummary] = Field(serialization_alias="recentOrders")


class CustomerWishlistPayload(CommerceSchema):
    customer_id: str = Field(serialization_alias="customerId")
    utility_quick_links: list[StorefrontQuickLink] = Field(serialization_alias="utilityQuickLinks")
    wishlist_products: list[CatalogProductDetail] = Field(serialization_alias="wishlistProducts")
    updated_at: str = Field(serialization_alias="updatedAt")


class StorefrontCartPayload(CommerceSchema):
    customer_id: str = Field(serialization_alias="customerId")
    cart_id: str = Field(serialization_alias="cartId")
    status: CartStatus
    trust_signals: list[str] = Field(serialization_alias="trustSignals")
    cart_items: list[StorefrontCartItem] = Field(serialization_alias="cartItems")
    updated_at: str = Field(serialization_alias="updatedAt")


class CartItemQuantityUpdatePayload(CommerceSchema):
    quantity: int = Field(ge=1)


class AddCartItemPayload(CommerceSchema):
    product_id: str | None = Field(default=None, serialization_alias="productId")
    category_slug: str = Field(serialization_alias="categorySlug")
    product_slug: str = Field(serialization_alias="productSlug")
    color: str | None = None
    size: str | None = None
    quantity: int = Field(ge=1)


class CheckoutRecipient(CommerceSchema):
    recipient_name: str = Field(serialization_alias="recipientName")
    phone: str
    address_line: str = Field(serialization_alias="addressLine")


class CheckoutPaymentSummary(CommerceSchema):
    method_code: str = Field(serialization_alias="methodCode")
    method_label: str = Field(serialization_alias="methodLabel")
    confirmation_instruction: str = Field(serialization_alias="confirmationInstruction")
    due_label: str = Field(serialization_alias="dueLabel")


class OrderTotals(CommerceSchema):
    subtotal: int
    shipping: int
    service_fee: int = Field(serialization_alias="serviceFee")
    total: int


class SupportContact(CommerceSchema):
    whatsapp_number: str = Field(serialization_alias="whatsappNumber")
    whatsapp_href: str = Field(serialization_alias="whatsappHref")
    default_message: str = Field(serialization_alias="defaultMessage")
    confirmation_message: str = Field(serialization_alias="confirmationMessage")
    business_hours: str = Field(serialization_alias="businessHours")
    response_window: str = Field(serialization_alias="responseWindow")


class CheckoutSummaryPayload(CommerceSchema):
    order: OrderSummary
    checkout_steps: list[str] = Field(serialization_alias="checkoutSteps")
    cart_items: list[StorefrontCartItem] = Field(serialization_alias="cartItems")
    recipient: CheckoutRecipient
    payment: CheckoutPaymentSummary
    totals: OrderTotals
    support: SupportContact


class SupportPolicyArticle(CommerceSchema):
    id: str
    title: str
    summary: str
    href: str
    topics: list[SupportTopic]


class SupportHandoffRequest(CommerceSchema):
    customer_id: str | None = Field(default=None, serialization_alias="customerId")
    order_id: str | None = Field(default=None, serialization_alias="orderId")
    reason: str
    context_summary: str = Field(serialization_alias="contextSummary")
    requested_channel: Literal["whatsapp", "human_cs"] = Field(serialization_alias="requestedChannel")
    source: SupportSource


class SupportHandoffRecord(CommerceSchema):
    id: str
    status: Literal["draft", "ready"]
    next_action: str = Field(serialization_alias="nextAction")
    summary: str
    contact: SupportContact
    policy_articles: list[SupportPolicyArticle] = Field(serialization_alias="policyArticles")
