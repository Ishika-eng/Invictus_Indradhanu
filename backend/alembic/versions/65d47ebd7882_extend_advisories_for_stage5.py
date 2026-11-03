"""extend_advisories_for_stage5

Revision ID: 65d47ebd7882
Revises: 50f2a5feafe8
Create Date: 2026-11-04 00:54:37.295932

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import app.database.spatial


# revision identifiers, used by Alembic.
revision: str = '65d47ebd7882'
down_revision: Union[str, Sequence[str], None] = '50f2a5feafe8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('advisories', sa.Column('supporting_evidence', sa.JSON(), nullable=True))
    op.add_column('advisories', sa.Column('data_limitations', sa.Text(), nullable=True))
    op.add_column('advisories', sa.Column('model_version', sa.String(length=100), nullable=True))
    op.add_column('advisories', sa.Column('disclaimer', sa.Text(), nullable=True))
    op.add_column('advisories', sa.Column('needs_expert_review', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.alter_column('crops', 'ideal_soil',
               existing_type=sa.VARCHAR(length=150),
               type_=sa.String(length=200),
               existing_nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('crops', 'ideal_soil',
               existing_type=sa.String(length=200),
               type_=sa.VARCHAR(length=150),
               existing_nullable=True)
    op.drop_column('advisories', 'needs_expert_review')
    op.drop_column('advisories', 'disclaimer')
    op.drop_column('advisories', 'model_version')
    op.drop_column('advisories', 'data_limitations')
    op.drop_column('advisories', 'supporting_evidence')
