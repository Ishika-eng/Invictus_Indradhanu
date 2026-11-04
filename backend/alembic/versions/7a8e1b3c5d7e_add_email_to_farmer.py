"""add_email_to_farmer

Revision ID: 7a8e1b3c5d7e
Revises: 4d25962164fa
Create Date: 2026-11-05 00:46:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8e1b3c5d7e'
down_revision: Union[str, Sequence[str], None] = '4d25962164fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('farmers', sa.Column('email', sa.String(length=120), nullable=True))
    op.create_index(op.f('ix_farmers_email'), 'farmers', ['email'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_farmers_email'), table_name='farmers')
    op.drop_column('farmers', 'email')
