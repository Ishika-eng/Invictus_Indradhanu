from sqlalchemy import String
from sqlalchemy.types import TypeDecorator
from geoalchemy2 import Geometry


class PointGeometry(TypeDecorator):
    """Dialect-aware spatial geometry type for geographic Points (EPSG:4326 WGS84).

    Uses native PostGIS Geometry in PostgreSQL/Supabase and transparently falls
    back to string representations in SQLite to support lightweight testing.
    """

    impl = Geometry
    cache_ok = True

    def __init__(self, srid: int = 4326, **kwargs):
        kwargs.setdefault("spatial_index", False)
        super().__init__(**kwargs)
        self.srid = srid

    def load_dialect_impl(self, dialect):
        if dialect is not None and dialect.name == "sqlite":
            return dialect.type_descriptor(String(255))
        if dialect is None:
            return Geometry(geometry_type="POINT", srid=self.srid, spatial_index=False)
        return dialect.type_descriptor(
            Geometry(geometry_type="POINT", srid=self.srid, spatial_index=False)
        )


class PolygonGeometry(TypeDecorator):
    """Dialect-aware spatial geometry type for geographic Polygons (EPSG:4326 WGS84).

    Used for farm boundary polygons, zoning, and micro-climate sector mapping.
    """

    impl = Geometry
    cache_ok = True

    def __init__(self, srid: int = 4326, **kwargs):
        kwargs.setdefault("spatial_index", False)
        super().__init__(**kwargs)
        self.srid = srid

    def load_dialect_impl(self, dialect):
        if dialect is not None and dialect.name == "sqlite":
            return dialect.type_descriptor(String(2000))
        if dialect is None:
            return Geometry(geometry_type="POLYGON", srid=self.srid, spatial_index=False)
        return dialect.type_descriptor(
            Geometry(geometry_type="POLYGON", srid=self.srid, spatial_index=False)
        )
