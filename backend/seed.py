import sqlite3
import bcrypt
import uuid
from datetime import datetime, timezone

DB_PATH = "flexinvest.db"

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def simple_seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.now(timezone.utc).isoformat()
    
    print("🌱 Seeding admins with the specified emails...")
    
    # Specific admins from your requirement
    admins = [
        ("superadmin@squarecapital.ng", "Super Admin"),
        ("finance.admin@squarecapital.ng", "Finance Admin"),
        ("support.admin@squarecapital.ng", "Support Admin"),
        ("operations@squarecapital.ng", "Operations Manager"),
        ("compliance@squarecapital.ng", "Compliance Officer")
    ]
    
    # Seed specific admins
    for email, name in admins:
        admin_id = str(uuid.uuid4())
        password_hash = hash_password("123456")  # Using the same hashing as backend
        
        cursor.execute('''
            INSERT OR REPLACE INTO admins (id, email, password, name, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (admin_id, email, password_hash, name, now))
        print(f"✅ Created admin: {email} - {name}")
    
    # Also update the default admin password to be consistent
    cursor.execute('UPDATE admins SET password = ? WHERE email = ?', 
                   (hash_password("Admin123!"), "admin@flexinvest.com"))
    
    conn.commit()
    conn.close()
    
    print("\n✅ Admin seeding complete!")
    print("\n📋 Admin Login Credentials:")
    print("   All admins use password: 123456")
    print("\n👨‍💼 Admins:")
    for email, name in admins:
        print(f"   • {email} - {name}")
    print("   • admin@flexinvest.com - Admin (password: Admin123!)")

if __name__ == "__main__":
    simple_seed()