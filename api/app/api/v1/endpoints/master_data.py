from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import (
    InternalActor,
    require_master_data_read_access,
    require_master_data_write_access,
)
from app.schemas.master_data import (
    Brand,
    Collection,
    CreateBrandRequest,
    CreateCollectionRequest,
    CreateFabricRequest,
    CreateSizeChartRequest,
    Fabric,
    SizeChart,
)
from app.services.postgres_store import store

router = APIRouter(prefix="/master-data")


@router.get("/brands", response_model=list[Brand])
async def list_brands(
    _: Annotated[InternalActor, Depends(require_master_data_read_access)],
) -> list[Brand]:
    return store.list_brands()


@router.post("/brands", response_model=Brand, status_code=status.HTTP_201_CREATED)
async def create_brand(
    payload: CreateBrandRequest,
    _: Annotated[InternalActor, Depends(require_master_data_write_access)],
) -> Brand:
    return store.create_brand(payload)


@router.get("/collections", response_model=list[Collection])
async def list_collections(
    _: Annotated[InternalActor, Depends(require_master_data_read_access)],
) -> list[Collection]:
    return store.list_collections()


@router.post("/collections", response_model=Collection, status_code=status.HTTP_201_CREATED)
async def create_collection(
    payload: CreateCollectionRequest,
    _: Annotated[InternalActor, Depends(require_master_data_write_access)],
) -> Collection:
    return store.create_collection(payload)


@router.get("/fabrics", response_model=list[Fabric])
async def list_fabrics(
    _: Annotated[InternalActor, Depends(require_master_data_read_access)],
) -> list[Fabric]:
    return store.list_fabrics()


@router.post("/fabrics", response_model=Fabric, status_code=status.HTTP_201_CREATED)
async def create_fabric(
    payload: CreateFabricRequest,
    _: Annotated[InternalActor, Depends(require_master_data_write_access)],
) -> Fabric:
    return store.create_fabric(payload)


@router.get("/size-charts", response_model=list[SizeChart])
async def list_size_charts(
    _: Annotated[InternalActor, Depends(require_master_data_read_access)],
) -> list[SizeChart]:
    return store.list_size_charts()


@router.post("/size-charts", response_model=SizeChart, status_code=status.HTTP_201_CREATED)
async def create_size_chart(
    payload: CreateSizeChartRequest,
    _: Annotated[InternalActor, Depends(require_master_data_write_access)],
) -> SizeChart:
    return store.create_size_chart(payload)
