"""add_farm_crops_and_crop_phenology_profiles

Revision ID: 30a2f5244e2c
Revises: 9466e5cd077f
Create Date: 2026-11-04 00:14:18.819001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30a2f5244e2c'
down_revision: Union[str, Sequence[str], None] = '9466e5cd077f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Extend crops table with agronomic and environmental parameters
    with op.batch_alter_table('crops', schema=None) as batch_op:
        batch_op.add_column(sa.Column('temp_min_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('temp_max_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('temp_optimal_min_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('temp_optimal_max_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('water_requirement_mm_min', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('water_requirement_mm_max', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('rainfall_min_mm', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('rainfall_max_mm', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('soil_ph_min', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('soil_ph_max', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('growing_season', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('root_depth_cm', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('icon', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('agronomic_reference', sa.String(length=255), nullable=True))

    # 2. Extend crop_growth_stages table with cumulative days and critical thresholds
    with op.batch_alter_table('crop_growth_stages', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cumulative_start_day', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('cumulative_end_day', sa.Integer(), server_default='30', nullable=False))
        batch_op.add_column(sa.Column('temp_critical_min_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('temp_critical_max_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('vulnerability_notes', sa.String(length=500), nullable=True))

    # 3. Create farm_crops table for tracking cultivated crop cycles
    op.create_table(
        'farm_crops',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('farm_id', sa.Uuid(), nullable=False),
        sa.Column('crop_id', sa.Uuid(), nullable=False),
        sa.Column('variety', sa.String(length=120), nullable=True),
        sa.Column('cultivated_acreage', sa.Float(), nullable=False),
        sa.Column('sowing_date', sa.Date(), nullable=False),
        sa.Column('expected_harvest_date', sa.Date(), nullable=True),
        sa.Column('current_stage_id', sa.Uuid(), nullable=True),
        sa.Column('current_stage_name', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=30), server_default='active', nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['current_stage_id'], ['crop_growth_stages.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('farm_crops', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_farm_crops_crop_id'), ['crop_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_farm_crops_current_stage_id'), ['current_stage_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_farm_crops_farm_id'), ['farm_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_farm_crops_status'), ['status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('farm_crops')

    with op.batch_alter_table('crop_growth_stages', schema=None) as batch_op:
        batch_op.drop_column('vulnerability_notes')
        batch_op.drop_column('temp_critical_max_c')
        batch_op.drop_column('temp_critical_min_c')
        batch_op.drop_column('cumulative_end_day')
        batch_op.drop_column('cumulative_start_day')

    with op.batch_alter_table('crops', schema=None) as batch_op:
        batch_op.drop_column('agronomic_reference')
        batch_op.drop_column('icon')
        batch_op.drop_column('root_depth_cm')
        batch_op.drop_column('growing_season')
        batch_op.drop_column('soil_ph_max')
        batch_op.drop_column('soil_ph_min')
        batch_op.drop_column('rainfall_max_mm')
        batch_op.drop_column('rainfall_min_mm')
        batch_op.drop_column('water_requirement_mm_max')
        batch_op.drop_column('water_requirement_mm_min')
        batch_op.drop_column('temp_optimal_max_c')
        batch_op.drop_column('temp_optimal_min_c')
        batch_op.drop_column('temp_max_c')
        batch_op.drop_column('temp_min_c')
