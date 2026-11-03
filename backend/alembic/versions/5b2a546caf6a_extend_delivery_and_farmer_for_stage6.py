"""extend_delivery_and_farmer_for_stage6

Revision ID: 5b2a546caf6a
Revises: 65d47ebd7882
Create Date: 2026-11-04 01:04:28.876740

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import app.database.spatial


# revision identifiers, used by Alembic.
revision: str = '5b2a546caf6a'
down_revision: Union[str, Sequence[str], None] = '65d47ebd7882'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('delivery_logs', sa.Column('provider', sa.String(length=50), server_default='SIMULATION', nullable=False))
    op.add_column('delivery_logs', sa.Column('idempotency_key', sa.String(length=120), nullable=True))
    op.add_column('delivery_logs', sa.Column('retry_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('delivery_logs', sa.Column('is_simulation', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.create_index(op.f('ix_delivery_logs_idempotency_key'), 'delivery_logs', ['idempotency_key'], unique=False)
    op.add_column('farmers', sa.Column('preferred_channel', sa.String(length=20), server_default='SMS', nullable=False))
    op.add_column('farmers', sa.Column('is_opted_in', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    op.add_column('farmers', sa.Column('opt_out_reason', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('farmers', 'opt_out_reason')
    op.drop_column('farmers', 'is_opted_in')
    op.drop_column('farmers', 'preferred_channel')
    op.drop_index(op.f('ix_delivery_logs_idempotency_key'), table_name='delivery_logs')
    op.drop_column('delivery_logs', 'is_simulation')
    op.drop_column('delivery_logs', 'retry_count')
    op.drop_column('delivery_logs', 'idempotency_key')
    op.drop_column('delivery_logs', 'provider')
