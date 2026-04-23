from pydantic import BaseModel, ConfigDict, Field


class Brand(BaseModel):
    id: str
    code: str
    name: str
    brand_type: str = Field(serialization_alias="brandType")
    parent_brand_id: str | None = Field(default=None, serialization_alias="parentBrandId")
    is_active: bool = Field(serialization_alias="isActive")

    model_config = ConfigDict(populate_by_name=True)


class CreateBrandRequest(BaseModel):
    code: str
    name: str
    brand_type: str = Field(validation_alias="brandType")
    parent_brand_id: str | None = Field(default=None, validation_alias="parentBrandId")

    model_config = ConfigDict(populate_by_name=True)


class Collection(BaseModel):
    id: str
    brand_id: str = Field(serialization_alias="brandId")
    name: str
    campaign_name: str | None = Field(default=None, serialization_alias="campaignName")
    status: str

    model_config = ConfigDict(populate_by_name=True)


class CreateCollectionRequest(BaseModel):
    brand_id: str = Field(validation_alias="brandId")
    name: str
    campaign_name: str | None = Field(default=None, validation_alias="campaignName")
    status: str = "draft"

    model_config = ConfigDict(populate_by_name=True)


class Fabric(BaseModel):
    id: str
    code: str
    name: str
    composition: str | None = None
    notes: str | None = None


class CreateFabricRequest(BaseModel):
    code: str
    name: str
    composition: str | None = None
    notes: str | None = None


class SizeChartEntry(BaseModel):
    size_code: str = Field(serialization_alias="sizeCode")
    bust_cm: float | None = Field(default=None, serialization_alias="bustCm")
    waist_cm: float | None = Field(default=None, serialization_alias="waistCm")
    hip_cm: float | None = Field(default=None, serialization_alias="hipCm")
    length_cm: float | None = Field(default=None, serialization_alias="lengthCm")

    model_config = ConfigDict(populate_by_name=True)


class SizeChart(BaseModel):
    id: str
    brand_id: str = Field(serialization_alias="brandId")
    code: str
    name: str
    gender_scope: str | None = Field(default=None, serialization_alias="genderScope")
    entries: list[SizeChartEntry]

    model_config = ConfigDict(populate_by_name=True)


class CreateSizeChartRequest(BaseModel):
    brand_id: str = Field(validation_alias="brandId")
    code: str
    name: str
    gender_scope: str | None = Field(default=None, validation_alias="genderScope")
    entries: list[SizeChartEntry] = []

    model_config = ConfigDict(populate_by_name=True)
