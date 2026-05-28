from backend.database import SessionLocal
from backend.models import User, AnalysisHistory

def inspect_db():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("--- Users ---")
        for u in users:
            print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")
            
        analyses = db.query(AnalysisHistory).all()
        print("\n--- Analyses ---")
        for a in analyses:
            print(f"ID: {a.id}, UserID: {a.user_id}, Prediction: {a.prediction}")
            
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
