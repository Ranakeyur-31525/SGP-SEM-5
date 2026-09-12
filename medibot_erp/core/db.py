import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class InMemoryCollection:
    """Mock MongoDB Collection for offline/test environments."""
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict[str, Any]] = []

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if not query:
            return list(self.data)
        results = []
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        results = self.find(query)
        return results[0] if results else None

    def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if '_id' not in doc_copy:
            doc_copy['_id'] = str(len(self.data) + 1)
        self.data.append(doc_copy)
        return doc_copy

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        doc = self.find_one(query)
        if doc and '$set' in update:
            doc.update(update['$set'])
        return doc

    def delete_one(self, query: Dict[str, Any]):
        doc = self.find_one(query)
        if doc in self.data:
            self.data.remove(doc)
            return True
        return False

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))


class MongoDatabase:
    """Singleton MongoDB client with graceful in-memory storage fallback."""
    _instance = None

    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        self._mock_collections: Dict[str, InMemoryCollection] = {}

        uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/medibot_hospital_erp')
        try:
            import pymongo
            self.client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=1000)
            self.client.server_info()
            self.db = self.client.get_default_database()
            self.is_connected = True
            logger.info("Connected to MongoDB at %s", uri)
        except Exception as e:
            logger.warning("MongoDB not active (%s). Operating in-memory mode.", str(e))
            self.is_connected = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MongoDatabase()
        return cls._instance

    def get_collection(self, collection_name: str):
        if self.is_connected and self.db is not None:
            return self.db[collection_name]
        if collection_name not in self._mock_collections:
            self._mock_collections[collection_name] = InMemoryCollection(collection_name)
        return self._mock_collections[collection_name]

# Helper getters
def get_db():
    return MongoDatabase.get_instance()

def get_users_col():
    return get_db().get_collection('users')

def get_inventory_col():
    return get_db().get_collection('inventory')

def get_orders_col():
    return get_db().get_collection('prescriptions_orders')

def get_telemetry_col():
    return get_db().get_collection('robot_telemetry')

def get_billing_col():
    return get_db().get_collection('billing_invoices')

def get_drug_requests_col():
    return get_db().get_collection('drug_requests')

def get_delivery_orders_col():
    return get_db().get_collection('delivery_orders')
