from pymongo import MongoClient

MONGO_URI = "mongodb+srv://asmitaagarwal4:H4k5BJwXBwregu6O@cocotale.rifue3t.mongodb.net/?retryWrites=true&w=majority&appName=cocotale"
client = MongoClient(MONGO_URI)
db = client["apiverse"]
collection = db["apis"]
reviews = db["reviews"]