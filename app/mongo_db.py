from dotenv import load_dotenv
import os
from pymongo import MongoClient
import certifi


load_dotenv()

mongo_connection = os.getenv("MONGO_URI")

#  explicitly tell PyMongo to use a bundled set of trusted certificates via a package called certifi
client = MongoClient(mongo_connection,tlsCAFile=certifi.where())
db = client["citi"]