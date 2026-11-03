"""extend_climate_observations_for_stage3

Revision ID: 666002189a2d
Revises: 30a2f5244e2c
Create Date: 2026-11-04 00:23:56.241000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '666002189a2d'
down_revision: Union[str, Sequence[str], None] = '30a2f5244e2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('climate_observations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('observation_type', sa.String(length=30), server_default='current', nullable=False))
        batch_op.add_column(sa.Column('retrieval_timestamp', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False))
        batch_op.add_column(sa.Column('forecast_date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('forecast_day', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('temp_min_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('temp_max_c', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('weather_code', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('weather_condition', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('is_in_situ_sensor', sa.Boolean(), server_default=sa.text('false'), nullable=False))
        batch_op.add_column(sa.Column('sensor_id', sa.String(length=100), nullable=True))
        
        # Make soil metrics and feels_like nullable so physical absence of probe does not cause database write failure
        batch_op.alter_column('feels_like_c', existing_type=sa.Float(), nullable=True)
        batch_op.alter_column('soil_moisture_0_10cm_pct', existing_type=sa.Float(), nullable=True)
        batch_op.alter_column('soil_moisture_10_40cm_pct', existing_type=sa.Float(), nullable=True)

        batch_op.create_index(batch_op.f('ix_climate_observations_observation_type'), ['observation_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_climate_observations_forecast_date'), ['forecast_date'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('climate_observations', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_climate_observations_forecast_date'))
        batch_op.drop_index(batch_op.f('ix_climate_observations_observation_type'))
        batch_op.drop_column('sensor_id')
        batch_op.drop_column('is_in_situ_sensor')
        batch_op.drop_column('weather_condition')
        batch_op.drop_column('weather_code')
        batch_op.drop_column('temp_max_c')
        batch_op.drop_column('temp_min_c')
        batch_op.drop_column('forecast_day')
        batch_op.drop_column('forecast_date')
        batch_op.drop_column('retrieval_timestamp')
        batch_op.drop_column('observation_type')
