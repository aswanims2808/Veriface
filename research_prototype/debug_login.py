from backend.database import SessionLocal, engine
from backend.models import User
from backend.auth import hash_password, verify_password

def debug_user(username_input):
    db = SessionLocal()
    try:
        print(f"--- Debugging User: {username_input} ---")
        
        # 1. List all users to see what's in there
        users = db.query(User).all()
        print(f"Total users in DB: {len(users)}")
        for u in users:
            print(f" - ID: {u.id}, Username: '{u.username}', Email: '{u.email}'")

        # 2. Check specific user (Case Sensitive)
        user = db.query(User).filter(User.username == username_input).first()
        
        if user:
            print(f"\n[FOUND] User '{username_input}' exists.")
            print(f"Hash: {user.password_hash}")
            
            # 3. Test a known password
            # valid = verify_password("password", user.password_hash)
            # print(f"Password 'password' valid? {valid}")
        else:
            print(f"\n[NOT FOUND] User '{username_input}' does NOT exist.")
            
            # Check case-insensitive
            user_ci = db.query(User).filter(User.username.ilike(username_input)).first()
            if user_ci:
                print(f"[HINT] Found '{user_ci.username}' which matches case-insensitively.")
            else:
                print("[INFO] No matching user found even with case-insensitive search.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_user("CSEA")
