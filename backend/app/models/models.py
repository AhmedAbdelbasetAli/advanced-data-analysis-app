'''
from app import db
from sqlalchemy.dialects.postgresql import JSONB

class DynamicTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(JSONB, nullable=False)  # Store JSON data

    def to_dict(self):
        return {
            "id": self.id,
            "data": self.data
        }
'''