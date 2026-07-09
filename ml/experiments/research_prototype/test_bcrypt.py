import bcrypt

password = "password123"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
hashed_str = hashed.decode('utf-8')

print(f"Hashed: {hashed_str}")

is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed_str.encode('utf-8'))
print(f"Valid: {is_valid}")
