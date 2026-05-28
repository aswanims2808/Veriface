import sys
import os

# Add current dir to path just in case
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User
from auth import verify_password, hash_password

def debug_user(username_input):
    db = SessionLocal()
    try:
        print(f"--- Debugging User: {username_input} ---")
        
        users = db.query(User).all()
        print(f"Total users in DB: {len(users)}")
        for u in users:
            print(f" - ID: {u.id}, Username: '{u.username}', Email: '{u.email}'")

        user = db.query(User).filter(User.username == username_input).first()
        
        if user:
            print(f"\n[FOUND] User '{username_input}' exists.")
            print(f"Hash: {user.password_hash}")
            
            # Reset password to 'password123' if found to be sure
            new_pass = "password123"
            user.password_hash = hash_password(new_pass)
            db.commit()
            print(f"[ACTION] Password has been RESET to '{new_pass}' for testing.")
            
        else:
            print(f"\n[NOT FOUND] User '{username_input}' does NOT exist.")
            
            # Check case-insensitive
            user_ci = db.query(User).filter(User.username.ilike(username_input)).first()
            if user_ci:
                print(f"[HINT] Found '{user_ci.username}' which matches case-insensitively.")
            else:
                print(f"[ACTION] Creating user '{username_input}' with password 'password123'...")
                new_user = User(username=username_input, email=f"{username_input}@example.com")
                new_user.password_hash = hash_password("password123")
                db.add(new_user)
                db.commit()
                print("[SUCCESS] User created.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_user("s6")
