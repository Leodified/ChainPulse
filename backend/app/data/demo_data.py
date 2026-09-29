"""
ChainPulse Backend - Structured Demo Data Constants
Singapore Port Disruption scenario for SAP HackFest 2026.

ALL financial figures are locked here so every endpoint is consistent:
  - Max financial exposure: $28,300,000
  - Orders at risk value:   $28,100,000
  - Total order book value: $47,200,000
"""
from datetime import date, datetime, timezone

# ---------------------------------------------------------------------------
# Canonical disruption ID used everywhere
# ---------------------------------------------------------------------------
SINGAPORE_DISRUPTION_ID = "DISR-SG-2026-001"

# ---------------------------------------------------------------------------
# SUPPLIERS
# ---------------------------------------------------------------------------
SUPPLIERS = [
    {
        "id": "SG-LOGISTICS-01",
        "name": "Singapore Freight Hub",
        "tier": 1,
        "country": "Singapore",
        "city": "Singapore",
        "lat": 1.2644,
        "lng": 103.8185,
        "capacity_percent": 35.0,
        "status": "DISRUPTED",
        "category": "Logistics & Freight",
        "contact_name": "Tan Wei Ling",
        "contact_email": "weiling.tan@sg-freight.com",
        "annual_revenue_usd": 580_000_000,
        "on_time_delivery_rate": 0.31,
        "quality_score": 0.88,
        "risk_score": 0.91,
        "is_affected": True,
    },
    {
        "id": "MY-ELECTRONICS-01",
        "name": "Penang Electronics Manufacturing",
        "tier": 2,
        "country": "Malaysia",
        "city": "Penang",
        "lat": 5.4141,
        "lng": 100.3288,
        "capacity_percent": 62.0,
        "status": "AFFECTED",
        "category": "PCB & Electronics",
        "contact_name": "Rajesh Kumar",
        "contact_email": "r.kumar@penang-em.com",
        "annual_revenue_usd": 210_000_000,
        "on_time_delivery_rate": 0.58,
        "quality_score": 0.91,
        "risk_score": 0.74,
        "is_affected": True,
    },
    {
        "id": "TW-CHIPS-01",
        "name": "Taiwan Semiconductor Components",
        "tier": 2,
        "country": "Taiwan",
        "city": "Hsinchu",
        "lat": 24.8138,
        "lng": 120.9675,
        "capacity_percent": 88.0,
        "status": "AT_RISK",
        "category": "Semiconductor & Chips",
        "contact_name": "Chen Li-Wei",
        "contact_email": "liwei.chen@tw-chips.com",
        "annual_revenue_usd": 890_000_000,
        "on_time_delivery_rate": 0.79,
        "quality_score": 0.96,
        "risk_score": 0.62,
        "is_affected": True,
    },
    {
        "id": "JP-PRECISION-01",
        "name": "Osaka Precision Parts",
        "tier": 1,
        "country": "Japan",
        "city": "Osaka",
        "lat": 34.6937,
        "lng": 135.5023,
        "capacity_percent": 100.0,
        "status": "MONITORING",
        "category": "Precision Engineering",
        "contact_name": "Yamamoto Kenji",
        "contact_email": "k.yamamoto@osaka-precision.jp",
        "annual_revenue_usd": 340_000_000,
        "on_time_delivery_rate": 0.94,
        "quality_score": 0.98,
        "risk_score": 0.28,
        "is_affected": False,
    },
    {
        "id": "CN-ASSEMBLY-01",
        "name": "Shenzhen Assembly Partner",
        "tier": 1,
        "country": "China",
        "city": "Shenzhen",
        "lat": 22.5431,
        "lng": 114.0579,
        "capacity_percent": 95.0,
        "status": "MONITORING",
        "category": "Electronics Assembly",
        "contact_name": "Wang Fang",
        "contact_email": "fang.wang@sz-assembly.cn",
        "annual_revenue_usd": 1_200_000_000,
        "on_time_delivery_rate": 0.87,
        "quality_score": 0.89,
        "risk_score": 0.35,
        "is_affected": False,
    },
    {
        "id": "DE-SPECIALTY-01",
        "name": "Munich Specialty Chemicals",
        "tier": 3,
        "country": "Germany",
        "city": "Munich",
        "lat": 48.1351,
        "lng": 11.5820,
        "capacity_percent": 100.0,
        "status": "STABLE",
        "category": "Specialty Chemicals",
        "contact_name": "Hans Mueller",
        "contact_email": "h.mueller@munich-chem.de",
        "annual_revenue_usd": 95_000_000,
        "on_time_delivery_rate": 0.97,
        "quality_score": 0.99,
        "risk_score": 0.11,
        "is_affected": False,
    },
    {
        "id": "IN-ALTERNATE-01",
        "name": "Bangalore Electronics Alt",
        "tier": 2,
        "country": "India",
        "city": "Bangalore",
        "lat": 12.9716,
        "lng": 77.5946,
        "capacity_percent": 100.0,
        "status": "AVAILABLE",
        "category": "PCB & Electronics",
        "contact_name": "Priya Nair",
        "contact_email": "p.nair@blr-electronics.in",
        "annual_revenue_usd": 130_000_000,
        "on_time_delivery_rate": 0.82,
        "quality_score": 0.87,
        "risk_score": 0.22,
        "is_affected": False,
    },
]

# ---------------------------------------------------------------------------
# SUPPLIER RELATIONSHIPS
# ---------------------------------------------------------------------------
SUPPLIER_RELATIONSHIPS = [
    # SG hub receives from TW, MY
    {"parent_supplier_id": "TW-CHIPS-01",    "child_supplier_id": "SG-LOGISTICS-01", "relationship_type": "SUPPLIES_THROUGH", "criticality": "CRITICAL"},
    {"parent_supplier_id": "MY-ELECTRONICS-01","child_supplier_id": "SG-LOGISTICS-01","relationship_type": "SUPPLIES_THROUGH", "criticality": "HIGH"},
    # JP ships direct, but monitors SG congestion
    {"parent_supplier_id": "JP-PRECISION-01","child_supplier_id": "SG-LOGISTICS-01", "relationship_type": "TRANSITS_THROUGH", "criticality": "MEDIUM"},
    # CN ships direct to Frankfurt
    {"parent_supplier_id": "CN-ASSEMBLY-01", "child_supplier_id": "SG-LOGISTICS-01", "relationship_type": "TRANSITS_THROUGH", "criticality": "MEDIUM"},
    # IN-ALTERNATE is a potential backup for MY-ELECTRONICS
    {"parent_supplier_id": "IN-ALTERNATE-01","child_supplier_id": "MY-ELECTRONICS-01","relationship_type": "ALTERNATE_FOR",    "criticality": "LOW"},
]

# ---------------------------------------------------------------------------
# MATERIALS
# ---------------------------------------------------------------------------
MATERIALS = [
    {
        "id": "MAT-CHIP-001",
        "name": "Advanced Logic Chips (ARM v9)",
        "category": "Semiconductor",
        "unit": "units",
        "lead_time_days": 45,
        "criticality": "CRITICAL",
        "supplier_id": "TW-CHIPS-01",
        "unit_cost_usd": 48.50,
    },
    {
        "id": "MAT-PCB-001",
        "name": "PCB Assemblies (6-layer IoT)",
        "category": "Electronics",
        "unit": "units",
        "lead_time_days": 21,
        "criticality": "HIGH",
        "supplier_id": "MY-ELECTRONICS-01",
        "unit_cost_usd": 32.00,
    },
    {
        "id": "MAT-CONN-001",
        "name": "Precision Connectors (IP68)",
        "category": "Mechanical",
        "unit": "units",
        "lead_time_days": 14,
        "criticality": "HIGH",
        "supplier_id": "JP-PRECISION-01",
        "unit_cost_usd": 8.75,
    },
    {
        "id": "MAT-DISP-001",
        "name": "Display Panels (4.3\" OLED)",
        "category": "Display",
        "unit": "units",
        "lead_time_days": 28,
        "criticality": "MEDIUM",
        "supplier_id": "CN-ASSEMBLY-01",
        "unit_cost_usd": 22.40,
    },
    {
        "id": "MAT-CHEM-001",
        "name": "Specialty Adhesives (UV-cure)",
        "category": "Chemical",
        "unit": "liters",
        "lead_time_days": 30,
        "criticality": "LOW",
        "supplier_id": "DE-SPECIALTY-01",
        "unit_cost_usd": 145.00,
    },
]

# ---------------------------------------------------------------------------
# FACTORIES
# ---------------------------------------------------------------------------
FACTORIES = [
    {
        "id": "FACT-DE-001",
        "name": "Frankfurt Manufacturing Hub",
        "country": "Germany",
        "city": "Frankfurt",
        "lat": 50.1109,
        "lng": 8.6821,
        "capacity_units_per_day": 850,
        "current_utilization_percent": 62.0,
        "status": "CONSTRAINED",
        "primary_material_id": "MAT-CHIP-001",
    },
    {
        "id": "FACT-SG-001",
        "name": "Singapore Regional Assembly",
        "country": "Singapore",
        "city": "Singapore",
        "lat": 1.3521,
        "lng": 103.8198,
        "capacity_units_per_day": 400,
        "current_utilization_percent": 18.0,
        "status": "DISRUPTED",
        "primary_material_id": "MAT-PCB-001",
    },
    {
        "id": "FACT-MY-001",
        "name": "Kuala Lumpur Sub-Assembly",
        "country": "Malaysia",
        "city": "Kuala Lumpur",
        "lat": 3.1390,
        "lng": 101.6869,
        "capacity_units_per_day": 320,
        "current_utilization_percent": 55.0,
        "status": "AFFECTED",
        "primary_material_id": "MAT-PCB-001",
    },
]

# ---------------------------------------------------------------------------
# FACTORY-MATERIAL LINKS
# ---------------------------------------------------------------------------
FACTORY_MATERIALS = [
    # Frankfurt
    {"factory_id": "FACT-DE-001", "material_id": "MAT-CHIP-001", "daily_consumption_units": 800, "safety_stock_days": 14, "current_stock_units": 5600},
    {"factory_id": "FACT-DE-001", "material_id": "MAT-PCB-001",  "daily_consumption_units": 800, "safety_stock_days": 14, "current_stock_units": 3200},
    {"factory_id": "FACT-DE-001", "material_id": "MAT-CONN-001", "daily_consumption_units": 800, "safety_stock_days": 21, "current_stock_units": 9800},
    {"factory_id": "FACT-DE-001", "material_id": "MAT-DISP-001", "daily_consumption_units": 600, "safety_stock_days": 14, "current_stock_units": 4200},
    {"factory_id": "FACT-DE-001", "material_id": "MAT-CHEM-001", "daily_consumption_units": 15,  "safety_stock_days": 30, "current_stock_units": 240},
    # Singapore
    {"factory_id": "FACT-SG-001", "material_id": "MAT-CHIP-001", "daily_consumption_units": 380, "safety_stock_days": 7,  "current_stock_units": 420},
    {"factory_id": "FACT-SG-001", "material_id": "MAT-PCB-001",  "daily_consumption_units": 380, "safety_stock_days": 7,  "current_stock_units": 310},
    # KL
    {"factory_id": "FACT-MY-001", "material_id": "MAT-PCB-001",  "daily_consumption_units": 300, "safety_stock_days": 10, "current_stock_units": 1800},
    {"factory_id": "FACT-MY-001", "material_id": "MAT-CONN-001", "daily_consumption_units": 300, "safety_stock_days": 10, "current_stock_units": 1500},
    {"factory_id": "FACT-MY-001", "material_id": "MAT-DISP-001", "daily_consumption_units": 280, "safety_stock_days": 10, "current_stock_units": 1400},
]

# ---------------------------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------------------------
PRODUCTS = [
    {
        "id": "PROD-ISP-X1",
        "name": "IntelliSense Pro X1",
        "sku": "ISP-X1-ENT-2026",
        "category": "Enterprise IoT",
        "unit_price_usd": 1_850.00,
        "factory_id": "FACT-DE-001",
    },
    {
        "id": "PROD-DLG-5G",
        "name": "DataLink Gateway 5G",
        "sku": "DLG-5G-ENT-2026",
        "category": "Network Infrastructure",
        "unit_price_usd": 3_200.00,
        "factory_id": "FACT-DE-001",
    },
    {
        "id": "PROD-ECM-001",
        "name": "EdgeCompute Module",
        "sku": "ECM-001-IND-2026",
        "category": "Edge Computing",
        "unit_price_usd": 920.00,
        "factory_id": "FACT-SG-001",
    },
]

# ---------------------------------------------------------------------------
# CUSTOMERS
# ---------------------------------------------------------------------------
CUSTOMERS = [
    {"id": "CUST-DTE-001", "name": "Deutsche Telekom AG",         "country": "Germany",   "city": "Bonn",        "tier": 1, "annual_order_value_usd": 8_400_000, "account_manager": "Klaus Hoffmann"},
    {"id": "CUST-SIE-001", "name": "Siemens AG",                  "country": "Germany",   "city": "Munich",      "tier": 1, "annual_order_value_usd": 6_200_000, "account_manager": "Anna Schmidt"},
    {"id": "CUST-BSH-001", "name": "Bosch Industrial",            "country": "Germany",   "city": "Stuttgart",   "tier": 1, "annual_order_value_usd": 5_100_000, "account_manager": "Peter Weber"},
    {"id": "CUST-VOD-001", "name": "Vodafone UK",                  "country": "UK",        "city": "London",      "tier": 2, "annual_order_value_usd": 3_800_000, "account_manager": "Sarah Thompson"},
    {"id": "CUST-ORA-001", "name": "Orange SA",                    "country": "France",    "city": "Paris",       "tier": 2, "annual_order_value_usd": 3_200_000, "account_manager": "Jean-Pierre Moreau"},
    {"id": "CUST-NTT-001", "name": "NTT Data",                     "country": "Japan",     "city": "Tokyo",       "tier": 2, "annual_order_value_usd": 2_900_000, "account_manager": "Tanaka Hiroshi"},
    {"id": "CUST-TCS-001", "name": "Tata Consultancy Services",   "country": "India",     "city": "Mumbai",      "tier": 2, "annual_order_value_usd": 2_400_000, "account_manager": "Vikram Patel"},
    {"id": "CUST-KDD-001", "name": "KDDI Corporation",            "country": "Japan",     "city": "Tokyo",       "tier": 3, "annual_order_value_usd": 1_600_000, "account_manager": "Suzuki Masa"},
    {"id": "CUST-TLS-001", "name": "Telstra Enterprise",          "country": "Australia", "city": "Melbourne",   "tier": 3, "annual_order_value_usd": 1_200_000, "account_manager": "Michael Chen"},
    {"id": "CUST-STL-001", "name": "SingTel Business",            "country": "Singapore", "city": "Singapore",   "tier": 3, "annual_order_value_usd": 980_000,   "account_manager": "Lee Mei Shan"},
]

# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------
ROUTES = [
    {"id": "RTE-SG-DE-SEA", "origin_country": "Singapore", "destination_country": "Germany",   "transport_mode": "SEA",   "distance_km": 16200, "transit_days": 28, "cost_per_unit_usd": 42.00, "co2_kg_per_unit": 28.5,  "is_disrupted": True},
    {"id": "RTE-SG-DE-AIR", "origin_country": "Singapore", "destination_country": "Germany",   "transport_mode": "AIR",   "distance_km": 10200, "transit_days": 2,  "cost_per_unit_usd": 185.00,"co2_kg_per_unit": 189.0, "is_disrupted": False},
    {"id": "RTE-MY-DE-SEA", "origin_country": "Malaysia",  "destination_country": "Germany",   "transport_mode": "SEA",   "distance_km": 15800, "transit_days": 26, "cost_per_unit_usd": 38.00, "co2_kg_per_unit": 26.8,  "is_disrupted": False},
    {"id": "RTE-TW-DE-SEA", "origin_country": "Taiwan",    "destination_country": "Germany",   "transport_mode": "SEA",   "distance_km": 18400, "transit_days": 30, "cost_per_unit_usd": 45.00, "co2_kg_per_unit": 31.2,  "is_disrupted": True},
    {"id": "RTE-TW-DE-AIR", "origin_country": "Taiwan",    "destination_country": "Germany",   "transport_mode": "AIR",   "distance_km": 9200,  "transit_days": 2,  "cost_per_unit_usd": 178.00,"co2_kg_per_unit": 174.0, "is_disrupted": False},
    {"id": "RTE-JP-DE-SEA", "origin_country": "Japan",     "destination_country": "Germany",   "transport_mode": "SEA",   "distance_km": 21000, "transit_days": 32, "cost_per_unit_usd": 51.00, "co2_kg_per_unit": 35.6,  "is_disrupted": False},
    {"id": "RTE-IN-DE-AIR", "origin_country": "India",     "destination_country": "Germany",   "transport_mode": "AIR",   "distance_km": 7200,  "transit_days": 2,  "cost_per_unit_usd": 142.00,"co2_kg_per_unit": 138.0, "is_disrupted": False},
    {"id": "RTE-DE-UK-TRK", "origin_country": "Germany",   "destination_country": "UK",        "transport_mode": "TRUCK", "distance_km": 1200,  "transit_days": 2,  "cost_per_unit_usd": 8.50,  "co2_kg_per_unit": 3.2,   "is_disrupted": False},
    {"id": "RTE-DE-FR-TRK", "origin_country": "Germany",   "destination_country": "France",    "transport_mode": "TRUCK", "distance_km": 850,   "transit_days": 1,  "cost_per_unit_usd": 6.00,  "co2_kg_per_unit": 2.1,   "is_disrupted": False},
    {"id": "RTE-DE-JP-AIR", "origin_country": "Germany",   "destination_country": "Japan",     "transport_mode": "AIR",   "distance_km": 9400,  "transit_days": 2,  "cost_per_unit_usd": 182.00,"co2_kg_per_unit": 178.0, "is_disrupted": False},
    {"id": "RTE-DE-AU-AIR", "origin_country": "Germany",   "destination_country": "Australia", "transport_mode": "AIR",   "distance_km": 16100, "transit_days": 2,  "cost_per_unit_usd": 201.00,"co2_kg_per_unit": 198.0, "is_disrupted": False},
    {"id": "RTE-DE-SG-AIR", "origin_country": "Germany",   "destination_country": "Singapore", "transport_mode": "AIR",   "distance_km": 10200, "transit_days": 2,  "cost_per_unit_usd": 185.00,"co2_kg_per_unit": 189.0, "is_disrupted": False},
    {"id": "RTE-DE-IN-AIR", "origin_country": "Germany",   "destination_country": "India",     "transport_mode": "AIR",   "distance_km": 7200,  "transit_days": 2,  "cost_per_unit_usd": 142.00,"co2_kg_per_unit": 138.0, "is_disrupted": False},
]

# ---------------------------------------------------------------------------
# ORDERS (25 orders, total ~$47.2M, ~$28.1M at risk)
# ---------------------------------------------------------------------------
ORDERS = [
    # Deutsche Telekom (Tier 1) - large orders, AT_RISK
    {"id": "ORD-DTE-001", "customer_id": "CUST-DTE-001", "product_id": "PROD-ISP-X1",  "quantity": 1200, "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 15), "exposure_risk": "HIGH"},
    {"id": "ORD-DTE-002", "customer_id": "CUST-DTE-001", "product_id": "PROD-DLG-5G",  "quantity": 480,  "unit_price_usd": 3200.00, "status": "AT_RISK",  "due_date": date(2026, 10, 22), "exposure_risk": "HIGH"},
    {"id": "ORD-DTE-003", "customer_id": "CUST-DTE-001", "product_id": "PROD-ISP-X1",  "quantity": 600,  "unit_price_usd": 1850.00, "status": "DELAYED",  "due_date": date(2026, 11, 5),  "exposure_risk": "MEDIUM"},

    # Siemens (Tier 1) - AT_RISK
    {"id": "ORD-SIE-001", "customer_id": "CUST-SIE-001", "product_id": "PROD-ISP-X1",  "quantity": 900,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 18), "exposure_risk": "HIGH"},
    {"id": "ORD-SIE-002", "customer_id": "CUST-SIE-001", "product_id": "PROD-ECM-001", "quantity": 1800, "unit_price_usd": 920.00,  "status": "AT_RISK",  "due_date": date(2026, 10, 25), "exposure_risk": "HIGH"},
    {"id": "ORD-SIE-003", "customer_id": "CUST-SIE-001", "product_id": "PROD-DLG-5G",  "quantity": 250,  "unit_price_usd": 3200.00, "status": "ON_TRACK", "due_date": date(2026, 12, 1),  "exposure_risk": "LOW"},

    # Bosch (Tier 1)
    {"id": "ORD-BSH-001", "customer_id": "CUST-BSH-001", "product_id": "PROD-ISP-X1",  "quantity": 750,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 20), "exposure_risk": "HIGH"},
    {"id": "ORD-BSH-002", "customer_id": "CUST-BSH-001", "product_id": "PROD-ECM-001", "quantity": 1200, "unit_price_usd": 920.00,  "status": "DELAYED",  "due_date": date(2026, 11, 10), "exposure_risk": "MEDIUM"},
    {"id": "ORD-BSH-003", "customer_id": "CUST-BSH-001", "product_id": "PROD-DLG-5G",  "quantity": 180,  "unit_price_usd": 3200.00, "status": "ON_TRACK", "due_date": date(2026, 12, 15), "exposure_risk": "LOW"},

    # Vodafone UK (Tier 2)
    {"id": "ORD-VOD-001", "customer_id": "CUST-VOD-001", "product_id": "PROD-ISP-X1",  "quantity": 600,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 28), "exposure_risk": "HIGH"},
    {"id": "ORD-VOD-002", "customer_id": "CUST-VOD-001", "product_id": "PROD-DLG-5G",  "quantity": 200,  "unit_price_usd": 3200.00, "status": "DELAYED",  "due_date": date(2026, 11, 15), "exposure_risk": "MEDIUM"},

    # Orange SA (Tier 2)
    {"id": "ORD-ORA-001", "customer_id": "CUST-ORA-001", "product_id": "PROD-ISP-X1",  "quantity": 480,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 30), "exposure_risk": "HIGH"},
    {"id": "ORD-ORA-002", "customer_id": "CUST-ORA-001", "product_id": "PROD-ECM-001", "quantity": 900,  "unit_price_usd": 920.00,  "status": "ON_TRACK", "due_date": date(2026, 12, 5),  "exposure_risk": "LOW"},

    # NTT Data (Tier 2)
    {"id": "ORD-NTT-001", "customer_id": "CUST-NTT-001", "product_id": "PROD-ISP-X1",  "quantity": 350,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 11, 2),  "exposure_risk": "MEDIUM"},
    {"id": "ORD-NTT-002", "customer_id": "CUST-NTT-001", "product_id": "PROD-DLG-5G",  "quantity": 120,  "unit_price_usd": 3200.00, "status": "DELAYED",  "due_date": date(2026, 11, 20), "exposure_risk": "MEDIUM"},

    # TCS (Tier 2)
    {"id": "ORD-TCS-001", "customer_id": "CUST-TCS-001", "product_id": "PROD-ISP-X1",  "quantity": 280,  "unit_price_usd": 1850.00, "status": "ON_TRACK", "due_date": date(2026, 12, 10), "exposure_risk": "LOW"},
    {"id": "ORD-TCS-002", "customer_id": "CUST-TCS-001", "product_id": "PROD-ECM-001", "quantity": 600,  "unit_price_usd": 920.00,  "status": "AT_RISK",  "due_date": date(2026, 11, 5),  "exposure_risk": "MEDIUM"},

    # KDDI (Tier 3)
    {"id": "ORD-KDD-001", "customer_id": "CUST-KDD-001", "product_id": "PROD-ISP-X1",  "quantity": 180,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 11, 8),  "exposure_risk": "MEDIUM"},
    {"id": "ORD-KDD-002", "customer_id": "CUST-KDD-001", "product_id": "PROD-ECM-001", "quantity": 420,  "unit_price_usd": 920.00,  "status": "ON_TRACK", "due_date": date(2026, 12, 20), "exposure_risk": "LOW"},

    # Telstra (Tier 3)
    {"id": "ORD-TLS-001", "customer_id": "CUST-TLS-001", "product_id": "PROD-ISP-X1",  "quantity": 150,  "unit_price_usd": 1850.00, "status": "DELAYED",  "due_date": date(2026, 11, 12), "exposure_risk": "MEDIUM"},
    {"id": "ORD-TLS-002", "customer_id": "CUST-TLS-001", "product_id": "PROD-DLG-5G",  "quantity": 60,   "unit_price_usd": 3200.00, "status": "ON_TRACK", "due_date": date(2026, 12, 22), "exposure_risk": "LOW"},

    # SingTel (Tier 3) - most impacted by SG disruption
    {"id": "ORD-STL-001", "customer_id": "CUST-STL-001", "product_id": "PROD-ISP-X1",  "quantity": 120,  "unit_price_usd": 1850.00, "status": "AT_RISK",  "due_date": date(2026, 10, 12), "exposure_risk": "HIGH"},
    {"id": "ORD-STL-002", "customer_id": "CUST-STL-001", "product_id": "PROD-ECM-001", "quantity": 240,  "unit_price_usd": 920.00,  "status": "AT_RISK",  "due_date": date(2026, 10, 14), "exposure_risk": "HIGH"},

    # Additional orders to pad to 25
    {"id": "ORD-DTE-004", "customer_id": "CUST-DTE-001", "product_id": "PROD-ECM-001", "quantity": 1000, "unit_price_usd": 920.00,  "status": "ON_TRACK", "due_date": date(2026, 12, 28), "exposure_risk": "LOW"},
    {"id": "ORD-SIE-004", "customer_id": "CUST-SIE-001", "product_id": "PROD-ISP-X1",  "quantity": 400,  "unit_price_usd": 1850.00, "status": "DELAYED",  "due_date": date(2026, 11, 25), "exposure_risk": "MEDIUM"},
]

# ---------------------------------------------------------------------------
# SHIPMENTS (subset - key at-risk ones)
# ---------------------------------------------------------------------------
SHIPMENTS = [
    {"id": "SHIP-001", "order_id": "ORD-DTE-001", "route_id": "RTE-SG-DE-SEA", "status": "DELAYED",    "estimated_arrival": date(2026, 10, 28), "quantity": 1200, "current_location": "Singapore Port - Awaiting Berth"},
    {"id": "SHIP-002", "order_id": "ORD-DTE-002", "route_id": "RTE-SG-DE-SEA", "status": "DELAYED",    "estimated_arrival": date(2026, 11, 4),  "quantity": 480,  "current_location": "Anchored - MPA Zone B"},
    {"id": "SHIP-003", "order_id": "ORD-SIE-001", "route_id": "RTE-TW-DE-SEA", "status": "DELAYED",    "estimated_arrival": date(2026, 11, 2),  "quantity": 900,  "current_location": "Singapore Strait - Queue #14"},
    {"id": "SHIP-004", "order_id": "ORD-BSH-001", "route_id": "RTE-SG-DE-SEA", "status": "AT_RISK",    "estimated_arrival": date(2026, 11, 8),  "quantity": 750,  "current_location": "Port Klang - Diverted"},
    {"id": "SHIP-005", "order_id": "ORD-VOD-001", "route_id": "RTE-MY-DE-SEA", "status": "IN_TRANSIT", "estimated_arrival": date(2026, 11, 15), "quantity": 600,  "current_location": "Indian Ocean"},
    {"id": "SHIP-006", "order_id": "ORD-STL-001", "route_id": "RTE-DE-SG-AIR", "status": "DELAYED",    "estimated_arrival": date(2026, 10, 18), "quantity": 120,  "current_location": "Frankfurt Airport - Hold"},
]

# ---------------------------------------------------------------------------
# DISRUPTION EVENT
# ---------------------------------------------------------------------------
DISRUPTION_EVENT = {
    "id": SINGAPORE_DISRUPTION_ID,
    "title": "Singapore Port MPA Terminal Congestion",
    "category": "PORT_DISRUPTION",
    "severity": "HIGH",
    "status": "ACTIVE",
    "description": (
        "Typhoon Haikui has caused severe structural damage and congestion at Singapore's "
        "Tanjong Pagar Terminal (TPT), one of the world's busiest transshipment hubs. "
        "Container throughput has been reduced by 65% as berths remain partially submerged. "
        "Vessel queuing is averaging 8-12 days with 47 vessels currently at anchor. "
        "Multiple major shipping lines (Maersk, MSC, CMA CGM) are diverting cargo to "
        "alternative ports including Port Klang (MY) and Tanjong Pelepas (MY), adding "
        "4-7 days to transit times. The Maritime and Port Authority of Singapore (MPA) "
        "has declared a Force Majeure for affected consignments dated 18 Sep 2026 onwards."
    ),
    "location_name": "Tanjong Pagar Terminal, Singapore",
    "country": "Singapore",
    "lat": 1.2644,
    "lng": 103.8185,
    "affected_radius_km": 250.0,
    "source": "MPA Singapore Advisory + Maersk Shipping Advisory + Reuters",
    "source_url": "https://www.mpa.gov.sg/advisories/2026-09-18-typhoon-haikui",
    "detected_at": datetime(2026, 9, 20, 6, 15, 0, tzinfo=timezone.utc),
    "estimated_duration_days": 21,
    "confidence_score": 0.94,
    "company_exposure_level": "HIGH",
    "is_active": True,
}

# ---------------------------------------------------------------------------
# DISRUPTION IMPACTS  (entity_type, entity_id, impact_level, description, financial_impact_usd)
# ---------------------------------------------------------------------------
DISRUPTION_IMPACTS = [
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "supplier", "entity_id": "SG-LOGISTICS-01", "impact_level": "CRITICAL", "impact_description": "Primary logistics hub at Tanjong Pagar Terminal. 65% throughput reduction. 47 vessels at anchor. Berth availability ETA 8-12 days.", "financial_impact_usd": 14_200_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "supplier", "entity_id": "MY-ELECTRONICS-01","impact_level": "HIGH",     "impact_description": "PCB shipments delayed 7-14 days. Relying on Port Klang diversion adding $180/container premium. Stock runway 9 days.", "financial_impact_usd": 4_800_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "supplier", "entity_id": "TW-CHIPS-01",       "impact_level": "HIGH",     "impact_description": "Chip consignments en route to SG blocked. Alternative routing via Kaohsiung→Port Klang adds 6 days. Critical path at risk.", "financial_impact_usd": 6_100_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "supplier", "entity_id": "JP-PRECISION-01",   "impact_level": "MEDIUM",   "impact_description": "Monitoring situation. Direct route to Europe unaffected. Risk if SG congestion spreads to strait lanes.", "financial_impact_usd": 800_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "factory",  "entity_id": "FACT-SG-001",       "impact_level": "CRITICAL", "impact_description": "Singapore assembly completely disrupted. Utilization dropped to 18%. 400 units/day capacity offline.", "financial_impact_usd": 8_200_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "factory",  "entity_id": "FACT-MY-001",       "impact_level": "HIGH",     "impact_description": "KL sub-assembly affected by PCB delays from MY-ELECTRONICS. Utilization at 55%, dropping further.", "financial_impact_usd": 3_400_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "factory",  "entity_id": "FACT-DE-001",       "impact_level": "MEDIUM",   "impact_description": "Frankfurt hub constrained by incoming chip and PCB shortages. Utilization at 62%. Inventory runway 7 days for chips.", "financial_impact_usd": 5_600_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "material", "entity_id": "MAT-CHIP-001",      "impact_level": "CRITICAL", "impact_description": "Advanced logic chip supply critically constrained. Singapore transit blocked. 45-day lead time on new orders.", "financial_impact_usd": 9_800_000},
    {"disruption_id": SINGAPORE_DISRUPTION_ID, "entity_type": "material", "entity_id": "MAT-PCB-001",       "impact_level": "HIGH",     "impact_description": "PCB assemblies delayed. Penang production unaffected but outbound logistics severely disrupted.", "financial_impact_usd": 4_200_000},
]

# ---------------------------------------------------------------------------
# SCENARIOS
# ---------------------------------------------------------------------------
SCENARIOS = [
    {
        "id": "SCEN-SG-7D",
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "name": "7-Day Impact Projection",
        "time_horizon_days": 7,
        "status": "COMPLETED",
        "assumptions": "Port congestion persists at current 65% throughput reduction. No additional diversions. Safety stock buffers still active.",
    },
    {
        "id": "SCEN-SG-30D",
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "name": "30-Day Impact Projection",
        "time_horizon_days": 30,
        "status": "COMPLETED",
        "assumptions": "Partial recovery to 50% throughput by day 14. Chip inventories depleted by day 18. Production ramp-down required.",
    },
    {
        "id": "SCEN-SG-60D",
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "name": "60-Day Worst-Case Projection",
        "time_horizon_days": 60,
        "status": "COMPLETED",
        "assumptions": "Structural repairs take full 21 days. Recovery to 80% by day 35. Full recovery by day 50. No alternate supplier activated.",
    },
]

# ---------------------------------------------------------------------------
# SCENARIO SNAPSHOTS  (day → metrics)
# ---------------------------------------------------------------------------
SCENARIO_SNAPSHOTS = [
    # 7-day scenario - daily initial buffer depletion
    {"scenario_id": "SCEN-SG-7D", "day": 1,  "inventory_level_percent": 92.0, "production_capacity_percent": 95.0, "orders_at_risk_count": 3,  "financial_exposure_usd": 1_200_000,  "co2_impact_kg": 0,        "risk_level": "LOW"},
    {"scenario_id": "SCEN-SG-7D", "day": 2,  "inventory_level_percent": 82.0, "production_capacity_percent": 90.0, "orders_at_risk_count": 4,  "financial_exposure_usd": 1_900_000,  "co2_impact_kg": 0,        "risk_level": "LOW"},
    {"scenario_id": "SCEN-SG-7D", "day": 3,  "inventory_level_percent": 72.0, "production_capacity_percent": 85.0, "orders_at_risk_count": 6,  "financial_exposure_usd": 2_800_000,  "co2_impact_kg": 0,        "risk_level": "MEDIUM"},
    {"scenario_id": "SCEN-SG-7D", "day": 4,  "inventory_level_percent": 65.0, "production_capacity_percent": 80.0, "orders_at_risk_count": 7,  "financial_exposure_usd": 3_200_000,  "co2_impact_kg": 0,        "risk_level": "MEDIUM"},
    {"scenario_id": "SCEN-SG-7D", "day": 5,  "inventory_level_percent": 58.0, "production_capacity_percent": 75.0, "orders_at_risk_count": 8,  "financial_exposure_usd": 3_600_000,  "co2_impact_kg": 0,        "risk_level": "MEDIUM"},
    {"scenario_id": "SCEN-SG-7D", "day": 6,  "inventory_level_percent": 51.0, "production_capacity_percent": 72.0, "orders_at_risk_count": 8,  "financial_exposure_usd": 3_900_000,  "co2_impact_kg": 6_200,    "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-7D", "day": 7,  "inventory_level_percent": 45.0, "production_capacity_percent": 70.0, "orders_at_risk_count": 8,  "financial_exposure_usd": 4_200_000,  "co2_impact_kg": 12_400,   "risk_level": "HIGH"},

    # 30-day scenario - primary critical disruption window
    {"scenario_id": "SCEN-SG-30D", "day": 1,  "inventory_level_percent": 92.0, "production_capacity_percent": 95.0, "orders_at_risk_count": 3,  "financial_exposure_usd": 1_200_000,  "co2_impact_kg": 0,        "risk_level": "LOW"},
    {"scenario_id": "SCEN-SG-30D", "day": 5,  "inventory_level_percent": 58.0, "production_capacity_percent": 75.0, "orders_at_risk_count": 8,  "financial_exposure_usd": 3_600_000,  "co2_impact_kg": 6_000,    "risk_level": "MEDIUM"},
    {"scenario_id": "SCEN-SG-30D", "day": 10, "inventory_level_percent": 38.0, "production_capacity_percent": 62.0, "orders_at_risk_count": 11, "financial_exposure_usd": 6_700_000,  "co2_impact_kg": 18_200,   "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-30D", "day": 14, "inventory_level_percent": 28.0, "production_capacity_percent": 55.0, "orders_at_risk_count": 14, "financial_exposure_usd": 9_800_000,  "co2_impact_kg": 28_600,   "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-30D", "day": 18, "inventory_level_percent": 22.0, "production_capacity_percent": 50.0, "orders_at_risk_count": 18, "financial_exposure_usd": 14_100_000, "co2_impact_kg": 38_400,   "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-30D", "day": 21, "inventory_level_percent": 18.0, "production_capacity_percent": 45.0, "orders_at_risk_count": 22, "financial_exposure_usd": 18_700_000, "co2_impact_kg": 48_200,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-30D", "day": 25, "inventory_level_percent": 18.0, "production_capacity_percent": 45.0, "orders_at_risk_count": 22, "financial_exposure_usd": 23_500_000, "co2_impact_kg": 54_000,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-30D", "day": 30, "inventory_level_percent": 18.0, "production_capacity_percent": 45.0, "orders_at_risk_count": 22, "financial_exposure_usd": 28_300_000, "co2_impact_kg": 58_800,   "risk_level": "CRITICAL"},

    # 60-day scenario - unmitigated long-term trajectory across the entire 60 days
    {"scenario_id": "SCEN-SG-60D", "day": 1,  "inventory_level_percent": 92.0, "production_capacity_percent": 95.0, "orders_at_risk_count": 3,  "financial_exposure_usd": 1_200_000,  "co2_impact_kg": 0,        "risk_level": "LOW"},
    {"scenario_id": "SCEN-SG-60D", "day": 7,  "inventory_level_percent": 45.0, "production_capacity_percent": 70.0, "orders_at_risk_count": 8,  "financial_exposure_usd": 4_200_000,  "co2_impact_kg": 12_400,   "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-60D", "day": 14, "inventory_level_percent": 28.0, "production_capacity_percent": 55.0, "orders_at_risk_count": 14, "financial_exposure_usd": 9_800_000,  "co2_impact_kg": 28_600,   "risk_level": "HIGH"},
    {"scenario_id": "SCEN-SG-60D", "day": 21, "inventory_level_percent": 18.0, "production_capacity_percent": 45.0, "orders_at_risk_count": 22, "financial_exposure_usd": 18_700_000, "co2_impact_kg": 48_200,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-60D", "day": 28, "inventory_level_percent": 12.0, "production_capacity_percent": 35.0, "orders_at_risk_count": 22, "financial_exposure_usd": 22_400_000, "co2_impact_kg": 58_000,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-60D", "day": 35, "inventory_level_percent": 8.0,  "production_capacity_percent": 25.0, "orders_at_risk_count": 25, "financial_exposure_usd": 25_800_000, "co2_impact_kg": 68_000,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-60D", "day": 42, "inventory_level_percent": 5.0,  "production_capacity_percent": 20.0, "orders_at_risk_count": 25, "financial_exposure_usd": 28_300_000, "co2_impact_kg": 76_000,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-60D", "day": 50, "inventory_level_percent": 4.0,  "production_capacity_percent": 18.0, "orders_at_risk_count": 25, "financial_exposure_usd": 28_300_000, "co2_impact_kg": 84_000,   "risk_level": "CRITICAL"},
    {"scenario_id": "SCEN-SG-60D", "day": 60, "inventory_level_percent": 2.0,  "production_capacity_percent": 15.0, "orders_at_risk_count": 25, "financial_exposure_usd": 28_300_000, "co2_impact_kg": 91_200,   "risk_level": "CRITICAL"},
]

# ---------------------------------------------------------------------------
# RECOVERY STRATEGIES
# ---------------------------------------------------------------------------
RECOVERY_STRATEGIES = [
    {
        "id": "STRAT-A-ALT-SUPPLIER",
        "scenario_id": "SCEN-SG-30D",
        "name": "Strategy A: Alternate Supplier Activation",
        "strategy_type": "SUPPLIER_DIVERSIFICATION",
        "description": (
            "Activate IN-ALTERNATE-01 (Bangalore Electronics Alt) as emergency PCB supplier. "
            "Negotiate expedited onboarding with 14-day qualification timeline. "
            "Air freight first 5,000 PCB units to Frankfurt while sea freight ramp-up completes. "
            "Parallel activation of backup chip sourcing from MediaTek via alternate distributor."
        ),
        "estimated_recovery_days": 18,
        "estimated_cost_usd": 1_200_000,
        "operational_risk_level": "MEDIUM",
        "co2_impact_kg": 38_400,
        "feasibility_score": 0.78,
        "assumptions": "IN-ALTERNATE-01 can qualify within 14 days; air freight capacity available; no quality incidents during expedited qualification.",
        "trade_offs": "Higher unit cost (+$8.50/PCB from India vs Malaysia). Quality risk during transition. 18-day gap still exposes ~$8.4M in orders.",
        "status": "PROPOSED",
    },
    {
        "id": "STRAT-B-AIR-FREIGHT",
        "scenario_id": "SCEN-SG-30D",
        "name": "Strategy B: Emergency Air Freight Bridge",
        "strategy_type": "LOGISTICS_REROUTING",
        "description": (
            "Immediately air freight all priority components (chips, PCBs) from existing suppliers "
            "bypassing Singapore port entirely. Use Frankfurt cargo flights from Hsinchu (TW) and "
            "Penang (MY) directly. Charter capacity from Lufthansa Cargo and Cargolux. "
            "Estimated 8-day recovery to full Frankfurt production."
        ),
        "estimated_recovery_days": 8,
        "estimated_cost_usd": 3_800_000,
        "operational_risk_level": "LOW",
        "co2_impact_kg": 142_600,
        "feasibility_score": 0.92,
        "assumptions": "Air cargo capacity can be secured within 48 hours. Suppliers can switch to air-ready packaging. Airport clearance within 24h.",
        "trade_offs": "340% increase in logistics CO2 vs sea freight. $3.8M additional cost. Unsustainable beyond 2 weeks. ESG score impact -12 points.",
        "status": "RECOMMENDED",
    },
    {
        "id": "STRAT-C-REALLOCATION",
        "scenario_id": "SCEN-SG-30D",
        "name": "Strategy C: Inventory Reallocation & Customer Prioritization",
        "strategy_type": "DEMAND_MANAGEMENT",
        "description": (
            "Reallocate existing warehouse inventory from Tier 3 customers to Tier 1 accounts. "
            "Cancel/defer SingTel, KDDI, Telstra orders by 30-45 days. "
            "Concentrate remaining Frankfurt production on Deutsche Telekom, Siemens, Bosch. "
            "Estimated 5-day implementation with immediate financial exposure reduction."
        ),
        "estimated_recovery_days": 5,
        "estimated_cost_usd": 400_000,
        "operational_risk_level": "HIGH",
        "co2_impact_kg": 2_800,
        "feasibility_score": 0.65,
        "assumptions": "Tier 3 customers accept deferral without contract breach. Legal team confirms penalty clauses. No reputational cascade.",
        "trade_offs": "HIGH customer relationship risk. SingTel and KDDI may escalate to contract penalties. ~$580K in potential penalty clauses. Reputational damage in APAC market.",
        "status": "PROPOSED",
    },
]

# ---------------------------------------------------------------------------
# AGENT ACTIVITIES
# ---------------------------------------------------------------------------
AGENT_ACTIVITIES = [
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "EventAgent",
        "agent_role": "Disruption Detection & Validation",
        "task_description": "Monitor global feeds, validate Singapore port disruption, cross-reference with MPA advisory, Maersk bulletin, and Reuters news.",
        "status": "COMPLETED",
        "reasoning_summary": "Detected MPA advisory at 06:15 UTC. Cross-referenced with 2 shipping line bulletins and 1 news source. Signal strength 0.94. Classified as PORT_DISRUPTION/HIGH severity based on 65% throughput reduction and 47 vessels at anchor.",
        "evidence_used": "MPA Advisory 2026-09-18; Maersk Shipping Advisory SG-2026-09-19; Reuters: 'Typhoon Haikui Hammers Singapore Port' 2026-09-20",
        "output_summary": "Disruption confirmed: DISR-SG-2026-001. Severity: HIGH. Company exposure: HIGH. Notified Impact Agent and Orchestrator.",
        "started_at": datetime(2026, 9, 20, 6, 15, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 6, 42, 0, tzinfo=timezone.utc),
        "confidence_score": 0.94,
    },
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "ResearchAgent",
        "agent_role": "External Intelligence Gathering",
        "task_description": "Gather port authority data, shipping line advisories, competitor impact reports, and alternative port capacity data.",
        "status": "COMPLETED",
        "reasoning_summary": "Queried 6 external sources. Port Klang and Tanjong Pelepas confirm 30% capacity surge. Competitors ASML and Infineon also diverted. Alternative air cargo capacity at Changi Airport at 78% utilization - available. Identified IN-ALTERNATE-01 as viable backup PCB supplier with 14-day qualification window.",
        "evidence_used": "Port Klang Authority capacity bulletin; Tanjong Pelepas press release; Changi Airport cargo stats API; Competitor 8-K filings; IN-ALTERNATE-01 supplier capability sheet",
        "output_summary": "Alternative routes identified: Port Klang (+4 days, +$180/container), Air freight via Changi (+$143/unit, available). Alternate supplier IN-ALTERNATE-01 viable in 14 days.",
        "started_at": datetime(2026, 9, 20, 6, 45, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 8, 12, 0, tzinfo=timezone.utc),
        "confidence_score": 0.88,
    },
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "ImpactAgent",
        "agent_role": "Supply Chain Impact Tracing",
        "task_description": "Trace disruption impact through 4-tier supply chain network. Identify critical paths, inventory runways, and factory impact.",
        "status": "COMPLETED",
        "reasoning_summary": "Traced 2 critical paths: (1) TW-CHIPS → SG-HUB → FACT-DE → ISP-X1 → Tier1 Customers. (2) MY-PCB → SG-HUB → FACT-SG/MY → ECM → Tier2 Customers. Frankfurt chip runway: 7 days at current consumption. SG factory effectively offline (18% utilization). 25 orders exposed totaling $28.1M.",
        "evidence_used": "Live inventory data from SAP S/4HANA; Factory OEE dashboard; Supplier capacity confirmations; Order book from CRM",
        "output_summary": "Critical path 1 (chips): runway 7 days. Critical path 2 (PCBs): runway 9 days. 8 suppliers impacted across 4 tiers. 3 factories affected. 25 orders at risk, $28.1M exposure.",
        "started_at": datetime(2026, 9, 20, 8, 15, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 9, 48, 0, tzinfo=timezone.utc),
        "confidence_score": 0.91,
    },
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "FinanceESGAgent",
        "agent_role": "Financial & ESG Impact Quantification",
        "task_description": "Calculate full financial exposure across all scenarios. Quantify CO2 impact of each recovery path. Assess ESG score implications.",
        "status": "COMPLETED",
        "reasoning_summary": "7-day exposure: $4.2M. 30-day exposure: $18.7M. 60-day worst-case: $28.3M. Air freight bridge (Strategy B): adds 142,600 kg CO2 (340% increase vs sea). Alternate supplier (Strategy A): +12% CO2 from increased air freight for qualification phase. Customer reallocation (Strategy C): +2% CO2, but HIGH relationship risk with $580K penalty exposure.",
        "evidence_used": "Order book value analysis; IMO CO2 emission factors; Air cargo emission factors (ICAO); Customer contract penalty clauses; Insurance coverage assessment",
        "output_summary": "Max exposure: $28.3M (60-day no-action). Recommended action threshold: $4.2M (7-day). ESG impact: Strategy B worst (-12 ESG points), Strategy C medium (-4 ESG points), Strategy A best (-3 ESG points).",
        "started_at": datetime(2026, 9, 20, 9, 50, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 11, 15, 0, tzinfo=timezone.utc),
        "confidence_score": 0.89,
    },
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "RecoveryAgent",
        "agent_role": "Recovery Strategy Generation & Ranking",
        "task_description": "Generate ranked recovery strategies. Score by feasibility, cost, speed, risk, and ESG impact. Recommend optimal path.",
        "status": "COMPLETED",
        "reasoning_summary": "Generated 3 strategies. Ranked by risk-adjusted cost: Strategy B (air freight, feasibility 0.92) optimal for speed-critical Tier 1 orders. Strategy A (alt supplier, feasibility 0.78) optimal for sustained recovery beyond 3 weeks. Strategy C (reallocation, feasibility 0.65) only if budget-constrained and relationship risk is acceptable. Recommendation: B+A hybrid - immediate air freight bridge while qualifying IN-ALTERNATE-01.",
        "evidence_used": "Carrier capacity confirmations; IN-ALTERNATE-01 capability assessment; Customer contract SLA requirements; Board risk appetite framework",
        "output_summary": "3 strategies generated. Recommendation: Strategy B (immediate) + Strategy A (sustainable). Combined cost: $5.0M. Recovery: 8 days for Tier 1, 18 days for full recovery. Avoids $23.3M in exposure.",
        "started_at": datetime(2026, 9, 20, 11, 20, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 12, 45, 0, tzinfo=timezone.utc),
        "confidence_score": 0.86,
    },
    {
        "disruption_id": SINGAPORE_DISRUPTION_ID,
        "agent_name": "OrchestratorAgent",
        "agent_role": "Workflow Coordination & Executive Synthesis",
        "task_description": "Coordinate all agent outputs. Synthesize final executive brief. Prepare board-ready recommendation package.",
        "status": "COMPLETED",
        "reasoning_summary": "Consolidated outputs from 5 specialist agents. Validated consistency of financial figures across all reports. Identified one discrepancy in CO2 calculation (resolved by FinanceESGAgent v2 run). Final recommendation: Approve Strategy B immediately, initiate Strategy A onboarding. Escalate to VP Supply Chain for approval within 4 hours.",
        "evidence_used": "All agent outputs; Historical disruption playbook (2021 Suez, 2022 Shanghai lockdown); Board risk tolerance guidelines",
        "output_summary": "Executive brief prepared. Recommended: Hybrid B+A strategy. Decision required: Within 4 hours to preserve 8-day recovery window. Financial authorization needed: $5.0M. Stakeholders notified: VP Supply Chain, CFO, Head of Procurement.",
        "started_at": datetime(2026, 9, 20, 12, 50, 0, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 9, 20, 13, 28, 0, tzinfo=timezone.utc),
        "confidence_score": 0.93,
    },
]
