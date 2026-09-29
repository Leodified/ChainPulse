"""
ChainPulse Backend - Supply Chain ORM Models
Covers: Supplier, Material, Factory, Product, Customer, Order, Route, Shipment.
Uses SQLAlchemy 2.0 mapped_column style.
"""
from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tier: Mapped[int] = mapped_column(Integer, nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    capacity_percent: Mapped[float] = mapped_column(Float, default=100.0)
    status: Mapped[str] = mapped_column(String(50), default="STABLE")
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_name: Mapped[Optional[str]] = mapped_column(String(200))
    contact_email: Mapped[Optional[str]] = mapped_column(String(200))
    annual_revenue_usd: Mapped[Optional[float]] = mapped_column(Float)
    on_time_delivery_rate: Mapped[Optional[float]] = mapped_column(Float)
    quality_score: Mapped[Optional[float]] = mapped_column(Float)
    risk_score: Mapped[Optional[float]] = mapped_column(Float)
    is_affected: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    materials: Mapped[List["Material"]] = relationship(
        "Material", back_populates="supplier"
    )
    parent_relationships: Mapped[List["SupplierRelationship"]] = relationship(
        "SupplierRelationship",
        foreign_keys="SupplierRelationship.parent_supplier_id",
        back_populates="parent_supplier",
    )
    child_relationships: Mapped[List["SupplierRelationship"]] = relationship(
        "SupplierRelationship",
        foreign_keys="SupplierRelationship.child_supplier_id",
        back_populates="child_supplier",
    )



class SupplierRelationship(Base):
    __tablename__ = "supplier_relationships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    parent_supplier_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("suppliers.id"), nullable=False
    )
    child_supplier_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("suppliers.id"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(String(50), default="SUPPLIES_TO")
    criticality: Mapped[str] = mapped_column(String(20), default="HIGH")

    parent_supplier: Mapped["Supplier"] = relationship(
        "Supplier",
        foreign_keys=[parent_supplier_id],
        back_populates="parent_relationships",
    )
    child_supplier: Mapped["Supplier"] = relationship(
        "Supplier",
        foreign_keys=[child_supplier_id],
        back_populates="child_relationships",
    )


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), default="units")
    lead_time_days: Mapped[int] = mapped_column(Integer, nullable=False)
    criticality: Mapped[str] = mapped_column(String(20), default="HIGH")
    supplier_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("suppliers.id"), nullable=False
    )
    unit_cost_usd: Mapped[float] = mapped_column(Float, nullable=False)

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="materials")
    factory_materials: Mapped[List["FactoryMaterial"]] = relationship(
        "FactoryMaterial", back_populates="material"
    )
    primary_factories: Mapped[List["Factory"]] = relationship(
        "Factory", back_populates="primary_material"
    )


class Factory(Base):
    __tablename__ = "factories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    capacity_units_per_day: Mapped[int] = mapped_column(Integer, nullable=False)
    current_utilization_percent: Mapped[float] = mapped_column(Float, default=100.0)
    status: Mapped[str] = mapped_column(String(50), default="OPERATIONAL")
    primary_material_id: Mapped[Optional[str]] = mapped_column(
        String(50), ForeignKey("materials.id")
    )

    primary_material: Mapped[Optional["Material"]] = relationship(
        "Material", back_populates="primary_factories"
    )
    factory_materials: Mapped[List["FactoryMaterial"]] = relationship(
        "FactoryMaterial", back_populates="factory"
    )
    products: Mapped[List["Product"]] = relationship(
        "Product", back_populates="factory"
    )


class FactoryMaterial(Base):
    __tablename__ = "factory_materials"

    factory_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("factories.id"), primary_key=True
    )
    material_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("materials.id"), primary_key=True
    )
    daily_consumption_units: Mapped[float] = mapped_column(Float, nullable=False)
    safety_stock_days: Mapped[int] = mapped_column(Integer, default=14)
    current_stock_units: Mapped[float] = mapped_column(Float, nullable=False)

    factory: Mapped["Factory"] = relationship(
        "Factory", back_populates="factory_materials"
    )
    material: Mapped["Material"] = relationship(
        "Material", back_populates="factory_materials"
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    unit_price_usd: Mapped[float] = mapped_column(Float, nullable=False)
    factory_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("factories.id"), nullable=False
    )

    factory: Mapped["Factory"] = relationship("Factory", back_populates="products")
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="product")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    tier: Mapped[int] = mapped_column(Integer, nullable=False)
    annual_order_value_usd: Mapped[float] = mapped_column(Float, nullable=False)
    account_manager: Mapped[Optional[str]] = mapped_column(String(200))

    orders: Mapped[List["Order"]] = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    customer_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("customers.id"), nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_usd: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ON_TRACK")
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    exposure_risk: Mapped[str] = mapped_column(String(20), default="LOW")

    customer: Mapped["Customer"] = relationship("Customer", back_populates="orders")
    product: Mapped["Product"] = relationship("Product", back_populates="orders")
    shipments: Mapped[List["Shipment"]] = relationship(
        "Shipment", back_populates="order"
    )


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    origin_country: Mapped[str] = mapped_column(String(100), nullable=False)
    destination_country: Mapped[str] = mapped_column(String(100), nullable=False)
    transport_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    transit_days: Mapped[int] = mapped_column(Integer, nullable=False)
    cost_per_unit_usd: Mapped[float] = mapped_column(Float, nullable=False)
    co2_kg_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    is_disrupted: Mapped[bool] = mapped_column(Boolean, default=False)

    shipments: Mapped[List["Shipment"]] = relationship(
        "Shipment", back_populates="route"
    )


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    order_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("orders.id"), nullable=False
    )
    route_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("routes.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="IN_TRANSIT")
    estimated_arrival: Mapped[Optional[date]] = mapped_column(Date)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_location: Mapped[Optional[str]] = mapped_column(String(200))

    order: Mapped["Order"] = relationship("Order", back_populates="shipments")
    route: Mapped["Route"] = relationship("Route", back_populates="shipments")


