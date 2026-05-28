import sqlite3
import os

db_path = 'backend/veriface.db'

if not os.path.exists(db_path):
    print(f"Database {db_path} not found. Skipping migration.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(analysis_history)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'detection_type' not in columns:
            print("Adding column detection_type to analysis_history...")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN detection_type VARCHAR(20) DEFAULT 'Single'")
        else:
            print("Column detection_type already exists.")
            
        if 'status' not in columns:
            print("Adding column status to analysis_history...")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN status VARCHAR(20) DEFAULT 'Completed'")
        else:
            print("Column status already exists.")

        if 'stored_filename' not in columns:
            print("Adding column stored_filename to analysis_history...")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN stored_filename VARCHAR(255)")
        else:
            print("Column stored_filename already exists.")
            
        conn.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()
