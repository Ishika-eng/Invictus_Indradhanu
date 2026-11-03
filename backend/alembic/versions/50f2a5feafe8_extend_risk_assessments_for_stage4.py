"""extend_risk_assessments_for_stage4

Revision ID: 50f2a5feafe8
Revises: 666002189a2d
Create Date: 2026-11-04 00:35:45.123000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50f2a5feafe8'
down_revision: Union[str, Sequence[str], None] = '666002189a2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('risk_assessments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('waterlogging_risk_score', sa.Float(), server_default='0.0', nullable=True))
        batch_op.add_column(sa.Column('heat_risk_score', sa.Float(), server_default='0.0', nullable=True))
        batch_op.add_column(sa.Column('cold_risk_score', sa.Float(), server_default='0.0', nullable=True))
        batch_op.add_column(sa.Column('humidity_disease_risk_score', sa.Float(), server_default='0.0', nullable=True))
        batch_op.add_column(sa.Column('confidence_level', sa.String(length=20), server_default='HIGH', nullable=False))
        batch_op.add_column(sa.Column('scoring_methodology', sa.String(length=100), server_default='AGRONOMIC_MULTI_CRITERIA_V1', nullable=False))
        batch_op.add_column(sa.Column('daily_timeline', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('input_snapshot', sa.JSON(), nullable=True))
        batch_op.alter_column('soil_moisture_risk_score', existing_type=sa.Float(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('risk_assessments', schema=None) as batch_op:
        batch_op.drop_column('input_snapshot')
        batch_op.drop_column('daily_timeline')
        batch_op.drop_column('scoring_methodology')
        batch_op.drop_column('confidence_level')
        batch_op.drop_column('humidity_disease_risk_score')
        batch_op.drop_column('cold_risk_score')
        batch_op.drop_column('heat_risk_score')
        batch_op.drop_column('waterlogging_risk_score')
