from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import string
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
import base64
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import sqlite3
import json
from contextlib import asynccontextmanager
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite Database Configuration
DB_PATH = ROOT_DIR / "flexinvest.db"

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'flexinvest-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Email Configuration
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_EMAIL = os.environ.get('SMTP_EMAIL', 'flexinvest@gmail.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'APP_PASSWORD')
SMTP_DISPLAY_NAME = os.environ.get('SMTP_DISPLAY_NAME', 'FlexInvest')

# Company Bank Account (Static)
COMPANY_BANK = {
    "bank_name": "First Bank of Nigeria",
    "account_number": "3012345678",
    "account_name": "FlexInvest Limited"
}

# Investment Packages (Static)
INVESTMENT_PACKAGES = [
    {"id": "pkg_1", "capital": 10000, "daily_profit": 600, "duration": 42, "total_return": 25200},
    {"id": "pkg_2", "capital": 20000, "daily_profit": 1000, "duration": 42, "total_return": 42000},
    {"id": "pkg_3", "capital": 40000, "daily_profit": 1700, "duration": 42, "total_return": 71400},
    {"id": "pkg_4", "capital": 60000, "daily_profit": 2600, "duration": 42, "total_return": 109200},
    {"id": "pkg_5", "capital": 100000, "daily_profit": 4200, "duration": 42, "total_return": 176400},
    {"id": "pkg_6", "capital": 150000, "daily_profit": 6000, "duration": 42, "total_return": 252000},
    {"id": "pkg_7", "capital": 200000, "daily_profit": 7200, "duration": 42, "total_return": 302400},
    {"id": "pkg_8", "capital": 300000, "daily_profit": 10000, "duration": 42, "total_return": 420000},
]

# Support Links (Static)
SUPPORT_LINKS = {
    "whatsapp": "https://wa.me/2348012345678",
    "telegram": "https://t.me/flexinvest_support",
    "email": "support@flexinvest.com"
}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database connection pool
class Database:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._init_db()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _init_db(self):
        """Initialize database and create tables if they don't exist"""
        logger.info("Initializing database...")
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            is_verified BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS wallets (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            balance REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            otp TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS password_resets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            reset_token TEXT NOT NULL,
            otp TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            is_used BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS bank_accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            bank_name TEXT NOT NULL,
            account_number TEXT NOT NULL,
            account_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS investments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            package_id TEXT NOT NULL,
            capital REAL NOT NULL,
            daily_profit REAL NOT NULL,
            duration INTEGER NOT NULL,
            total_return REAL NOT NULL,
            days_completed INTEGER DEFAULT 0,
            profit_earned REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS deposits (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_name TEXT NOT NULL,
            amount REAL NOT NULL,
            proof_image TEXT NOT NULL,
            proof_filename TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            admin_note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS withdrawals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_name TEXT NOT NULL,
            amount REAL NOT NULL,
            bank_name TEXT NOT NULL,
            account_number TEXT NOT NULL,
            account_name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            admin_note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_name TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            admin_response TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at TEXT NOT NULL
        )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token)')
        
        # Seed default admin if not exists
        cursor.execute('SELECT * FROM admins WHERE email = ?', ('isquarecapitalventure@gmail.com',))
        if not cursor.fetchone():
            hashed_password = bcrypt.hashpw('Admin123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute('''
            INSERT INTO admins (id, email, password, name, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                str(uuid.uuid4()),
                'isquarecapitalventure@gmail.com',
                hashed_password,
                'Admin',
                'superadmin',
                datetime.now(timezone.utc).isoformat()
            ))
            logger.info("Default admin created: isquarecapitalventure@gmail.com / Admin123!")
        
        # Check and add role column if it doesn't exist
        try:
            cursor.execute('SELECT role FROM admins LIMIT 1')
        except sqlite3.OperationalError:
            logger.info("Adding role column to admins table...")
            cursor.execute('ALTER TABLE admins ADD COLUMN role TEXT DEFAULT "admin"')
            # Update existing admins
            cursor.execute('UPDATE admins SET role = "admin" WHERE role IS NULL')
        
        conn.commit()
        conn.close()
        logger.info("Database initialization complete")

# Initialize database
db = Database(DB_PATH)

# Create API router
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============= PYDANTIC MODELS =============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class ResendOTP(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class BankAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    account_name: str

class DepositCreate(BaseModel):
    amount: float

class WithdrawalCreate(BaseModel):
    amount: float

class InvestmentCreate(BaseModel):
    package_id: str

class ComplaintCreate(BaseModel):
    subject: str
    message: str

class AdminApproval(BaseModel):
    status: str  # approved or rejected
    reason: Optional[str] = None

class WalletCredit(BaseModel):
    user_id: str
    amount: float
    reason: str

# ============= UTILITY FUNCTIONS =============

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_reset_token():
    return secrets.token_urlsafe(32)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def create_token(user_id: str, role: str = "user", email: str = None) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    
    if payload.get("role") != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, full_name, phone, is_verified FROM users WHERE id = ?', (payload["user_id"],))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return dict(user)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    
    if payload.get("role") not in ["admin", "superadmin"]:
        logger.warning(f"Non-admin role trying to access admin endpoint: {payload.get('role')}")
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT id, email, name, role FROM admins WHERE id = ?', (payload["user_id"],))
    except sqlite3.OperationalError as e:
        # If role column doesn't exist, fall back to basic admin query
        logger.warning(f"Role column error, using fallback: {e}")
        cursor.execute('SELECT id, email, name FROM admins WHERE id = ?', (payload["user_id"],))
    
    admin = cursor.fetchone()
    conn.close()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    admin_dict = dict(admin)
    # If role is not in the result, add default
    if 'role' not in admin_dict:
        admin_dict['role'] = 'admin'
    
    return admin_dict

# ============= EMAIL TEMPLATE FUNCTIONS =============

def create_email_template(header: str, content: str, action_text: str = None, action_url: str = None) -> str:
    """Create a beautiful HTML email template"""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlexInvest</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .logo {{
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .tagline {{
            font-size: 16px;
            opacity: 0.9;
        }}
        .content {{
            background: white;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .greeting {{
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2d3748;
        }}
        .message {{
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
        }}
        .otp-container {{
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }}
        .otp {{
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 5px;
            font-family: monospace;
        }}
        .amount {{
            font-size: 28px;
            font-weight: bold;
            color: #2ecc71;
            margin: 15px 0;
        }}
        .details {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .detail-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }}
        .detail-row:last-child {{
            border-bottom: none;
        }}
        .label {{
            font-weight: 600;
            color: #4a5568;
        }}
        .value {{
            color: #2d3748;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin-top: 20px;
        }}
        .footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }}
        .support {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }}
        .warning {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .status {{
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }}
        .status-pending {{ background: #fff3cd; color: #856404; }}
        .status-approved {{ background: #d4edda; color: #155724; }}
        .status-rejected {{ background: #f8d7da; color: #721c24; }}
        .status-open {{ background: #cce5ff; color: #004085; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FlexInvest</div>
            <div class="tagline">Smart Investments, Brighter Future</div>
        </div>
        <div class="content">
            <div class="greeting">{header}</div>
            <div class="message">{content}</div>
            {f'<a href="{action_url}" class="button">{action_text}</a>' if action_text and action_url else ''}
        </div>
        <div class="footer">
            <p>© {datetime.now().year} FlexInvest. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
"""

async def send_email(to_email: str, subject: str, html_content: str):
    try:
        message = MIMEMultipart("alternative")
        message["From"] = formataddr((SMTP_DISPLAY_NAME, SMTP_EMAIL))
        message["To"] = to_email
        message["Subject"] = subject
        
        # Create HTML version
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_EMAIL,
            password=SMTP_PASSWORD,
            start_tls=True
            # start_tls=SMTP_PORT != 465
        )
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def format_currency(amount: float) -> str:
    return f"₦{amount:,.2f}"

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(data: UserRegister, background_tasks: BackgroundTasks):
    logger.info(f"Registration attempt for email: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE email = ?', (data.email,))
    if cursor.fetchone():
        conn.close()
        logger.warning(f"Registration failed: Email already registered - {data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    otp = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    now = datetime.now(timezone.utc).isoformat()
    
    try:
        # Insert user
        cursor.execute('''
        INSERT INTO users (id, email, password, full_name, phone, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            data.email,
            hash_password(data.password),
            data.full_name,
            data.phone,
            False,
            now
        ))
        
        # Insert wallet
        cursor.execute('''
        INSERT INTO wallets (id, user_id, balance, created_at)
        VALUES (?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            user_id,
            0.0,
            now
        ))
        
        # Insert OTP
        cursor.execute('''
        INSERT INTO otps (id, user_id, email, otp, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            user_id,
            data.email,
            otp,
            otp_expires.isoformat(),
            now
        ))
        
        conn.commit()
        logger.info(f"User registered successfully: {data.email}")
        
        # Send welcome email with OTP
        html = create_email_template(
            header=f"Welcome to FlexInvest, {data.full_name}!",
            content=f"""
            <p>Thank you for registering with FlexInvest! We're excited to have you on board.</p>
            <p>To complete your registration and start investing, please verify your email address using the OTP below:</p>
            <div class="otp-container">
                <div class="otp">{otp}</div>
                <p>This OTP will expire in 30 minutes.</p>
            </div>
            <div class="warning">
                <strong>Important:</strong> Never share your OTP with anyone. FlexInvest staff will never ask for your OTP.
            </div>
            """
        )
        background_tasks.add_task(send_email, data.email, "Welcome to FlexInvest - Verify Your Email", html)
        
        return {
            "message": "Registration successful. Please verify your email.",
            "email": data.email,
            "user_id": user_id
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Registration error for {data.email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@api_router.post("/auth/verify-otp")
async def verify_otp(data: OTPVerify, background_tasks: BackgroundTasks):
    logger.info(f"OTP verification attempt for: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get latest OTP for this email
    cursor.execute('''
    SELECT * FROM otps 
    WHERE email = ? 
    ORDER BY created_at DESC 
    LIMIT 1
    ''', (data.email,))
    
    otp_record = cursor.fetchone()
    
    if not otp_record:
        conn.close()
        logger.warning(f"No OTP found for: {data.email}")
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")
    
    # Check if OTP is expired
    expires_at = datetime.fromisoformat(otp_record["expires_at"].replace('Z', '+00:00'))
    if expires_at < datetime.now(timezone.utc):
        conn.close()
        logger.warning(f"OTP expired for: {data.email}")
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    # Verify OTP
    if otp_record["otp"] != data.otp:
        conn.close()
        logger.warning(f"Invalid OTP for: {data.email}")
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    
    # Mark user as verified
    cursor.execute('UPDATE users SET is_verified = 1 WHERE id = ?', (otp_record["user_id"],))
    
    # Get user details
    cursor.execute('SELECT id, email, full_name, is_verified FROM users WHERE id = ?', (otp_record["user_id"],))
    user = cursor.fetchone()
    
    conn.commit()
    conn.close()
    logger.info(f"Email verified successfully: {data.email}")
    
    # Create token for immediate login
    token = create_token(user["id"], "user", user["email"])
    
    # Send welcome email using background_tasks instead of asyncio.create_task
    html = create_email_template(
        header="🎉 Email Verified Successfully!",
        content=f"""
        <p>Congratulations, {user['full_name']}! Your email has been successfully verified.</p>
        <p>You now have full access to all FlexInvest features:</p>
        <ul>
            <li>Browse and select investment packages</li>
            <li>Make deposits and start earning</li>
            <li>Track your investments in real-time</li>
            <li>Withdraw your profits easily</li>
        </ul>
        <div class="support">
            <p><strong>Need help getting started?</strong></p>
            <p>Check out our investment guide or contact our support team.</p>
        </div>
        """
    )
    
    # Use background_tasks instead of asyncio.create_task
    background_tasks.add_task(send_email, user["email"], "FlexInvest - Email Verified Successfully", html)
    
    return {
        "message": "Email verified successfully",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_verified": user["is_verified"]
        }
    }

@api_router.post("/auth/resend-otp")
async def resend_otp(data: ResendOTP, background_tasks: BackgroundTasks):
    logger.info(f"Resend OTP request for: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT id, full_name, is_verified FROM users WHERE email = ?', (data.email,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        logger.warning(f"User not found for OTP resend: {data.email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["is_verified"]:
        conn.close()
        logger.warning(f"User already verified: {data.email}")
        raise HTTPException(status_code=400, detail="Email is already verified")
    
    # Generate new OTP
    otp = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    now = datetime.now(timezone.utc).isoformat()
    
    # Insert new OTP
    cursor.execute('''
    INSERT INTO otps (id, user_id, email, otp, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        str(uuid.uuid4()),
        user["id"],
        data.email,
        otp,
        otp_expires.isoformat(),
        now
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"New OTP generated for: {data.email}")
    
    # Send OTP email
    html = create_email_template(
        header="New Verification Code",
        content=f"""
        <p>You requested a new verification code for your FlexInvest account.</p>
        <p>Please use the OTP below to verify your email:</p>
        <div class="otp-container">
            <div class="otp">{otp}</div>
            <p>This OTP will expire in 30 minutes.</p>
        </div>
        <div class="warning">
            <strong>Security Tip:</strong> If you didn't request this code, please ignore this email and contact our support team immediately.
        </div>
        """
    )
    background_tasks.add_task(send_email, data.email, "FlexInvest - New Verification Code", html)
    
    return {"message": "New OTP sent to your email"}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """Request password reset"""
    logger.info(f"Forgot password request for: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, full_name FROM users WHERE email = ?', (data.email,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        # Don't reveal if user exists for security
        logger.info(f"Password reset requested for non-existent email: {data.email}")
        return {"message": "If an account exists with this email, you will receive reset instructions"}
    
    # Generate OTP and reset token
    otp = generate_otp()
    reset_token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    now = datetime.now(timezone.utc).isoformat()
    
    # Invalidate any existing reset tokens for this user
    cursor.execute('''
    UPDATE password_resets 
    SET is_used = 1 
    WHERE user_id = ? AND is_used = 0
    ''', (user["id"],))
    
    # Insert new reset token
    cursor.execute('''
    INSERT INTO password_resets (id, user_id, email, reset_token, otp, expires_at, is_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        str(uuid.uuid4()),
        user["id"],
        data.email,
        reset_token,
        otp,
        expires_at.isoformat(),
        False,
        now
    ))
    
    conn.commit()
    conn.close()
    
    # Send OTP email
    html = create_email_template(
        header="🔒 Password Reset Request",
        content=f"""
        <p>Hello {user['full_name']},</p>
        <p>You've requested to reset your FlexInvest account password.</p>
        <p>Use the OTP below to verify your identity:</p>
        <div class="otp-container">
            <div class="otp">{otp}</div>
            <p>This OTP will expire in 1 hour.</p>
        </div>
        <div class="warning">
            <strong>Security Alert:</strong>
            <ul>
                <li>Never share this OTP with anyone</li>
                <li>FlexInvest staff will never ask for your OTP</li>
                <li>If you didn't request this, please ignore this email</li>
            </ul>
        </div>
        <div class="support">
            <p>Once verified, you'll be able to set a new password for your account.</p>
        </div>
        """
    )
    
    background_tasks.add_task(send_email, data.email, "FlexInvest - Password Reset Verification", html)
    
    return {"message": "Reset instructions sent to your email"}

@api_router.post("/auth/verify-reset-otp")
async def verify_reset_otp(data: OTPVerify):
    """Verify OTP for password reset"""
    logger.info(f"Reset OTP verification for: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get latest valid reset request
    cursor.execute('''
    SELECT * FROM password_resets 
    WHERE email = ? AND is_used = 0 AND expires_at > ?
    ORDER BY created_at DESC 
    LIMIT 1
    ''', (data.email, datetime.now(timezone.utc).isoformat()))
    
    reset_request = cursor.fetchone()
    
    if not reset_request:
        conn.close()
        logger.warning(f"No valid reset request found for: {data.email}")
        raise HTTPException(status_code=400, detail="Invalid or expired reset request")
    
    # Verify OTP
    if reset_request["otp"] != data.otp:
        conn.close()
        logger.warning(f"Invalid reset OTP for: {data.email}")
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Mark OTP as verified (but not used for reset yet)
    conn.close()
    logger.info(f"Reset OTP verified for: {data.email}")
    
    return {
        "message": "OTP verified successfully",
        "reset_token": reset_request["reset_token"]
    }

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest, background_tasks: BackgroundTasks):
    """Reset password with OTP verification"""
    logger.info(f"Password reset attempt for: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Get reset request
    cursor.execute('''
    SELECT * FROM password_resets 
    WHERE email = ? AND otp = ? AND is_used = 0 AND expires_at > ?
    ORDER BY created_at DESC 
    LIMIT 1
    ''', (data.email, data.otp, datetime.now(timezone.utc).isoformat()))
    
    reset_request = cursor.fetchone()
    
    if not reset_request:
        conn.close()
        logger.warning(f"Invalid reset request for: {data.email}")
        raise HTTPException(status_code=400, detail="Invalid or expired reset request")
    
    # Update user password
    hashed_password = hash_password(data.new_password)
    cursor.execute('''
    UPDATE users 
    SET password = ?
    WHERE id = ?
    ''', (hashed_password, reset_request["user_id"]))
    
    # Mark reset token as used
    cursor.execute('''
    UPDATE password_resets 
    SET is_used = 1 
    WHERE id = ?
    ''', (reset_request["id"],))
    
    # Get user info for notification
    cursor.execute('SELECT email, full_name FROM users WHERE id = ?', (reset_request["user_id"],))
    user = cursor.fetchone()
    
    conn.commit()
    conn.close()
    
    logger.info(f"Password reset successful for: {data.email}")
    
    # Send password changed notification
    html = create_email_template(
        header="✅ Password Changed Successfully",
        content=f"""
        <p>Hello {user['full_name']},</p>
        <p>Your FlexInvest account password has been successfully changed.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Changed At:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC</span>
            </div>
        </div>
        <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
                <li>If you didn't make this change, contact support immediately</li>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
        </div>
        <div class="support">
            <p>You can now login with your new password.</p>
        </div>
        """
    )
    
    # Use background_tasks instead of asyncio.create_task
    background_tasks.add_task(send_email, user["email"], "FlexInvest - Password Changed", html)
    
    return {"message": "Password reset successfully"}

@api_router.post("/auth/login")
async def user_login(data: UserLogin, background_tasks: BackgroundTasks):
    logger.info(f"User login attempt: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # First check if it's an admin trying to login as user
    cursor.execute('SELECT * FROM admins WHERE email = ?', (data.email,))
    admin_check = cursor.fetchone()
    if admin_check:
        conn.close()
        logger.warning(f"Admin {data.email} attempted to login as user. Redirecting to admin login.")
        raise HTTPException(
            status_code=400, 
            detail="This is an admin account. Please use the admin login page."
        )
    
    cursor.execute('SELECT id, email, password, full_name, is_verified FROM users WHERE email = ?', (data.email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        logger.warning(f"User login failed: Email not found - {data.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(data.password, user["password"]):
        logger.warning(f"User login failed: Invalid password for - {data.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user["is_verified"]:
        logger.warning(f"User login failed: Email not verified - {data.email}")
        raise HTTPException(status_code=403, detail="Please verify your email first")
    
    token = create_token(user["id"], "user", user["email"])
    logger.info(f"User login successful: {data.email}")
    
    # Send login notification email
    html = create_email_template(
        header="🔒 New Login Detected",
        content=f"""
        <p>Hello {user['full_name']},</p>
        <p>A new login was detected on your FlexInvest account:</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Date & Time:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC</span>
            </div>
            <div class="detail-row">
                <span class="label">Device:</span>
                <span class="value">Unknown Device</span>
            </div>
            <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">Unknown Location</span>
            </div>
        </div>
        <div class="warning">
            <strong>Security Alert:</strong> If this wasn't you, please change your password immediately and contact our support team.
        </div>
        """
    )
    background_tasks.add_task(send_email, data.email, "FlexInvest - New Login Detected", html)
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_verified": user["is_verified"]
        }
    }

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    logger.info(f"Admin login attempt: {data.email}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, email, password, name, role FROM admins WHERE email = ?', (data.email,))
    except sqlite3.OperationalError:
        # If role column doesn't exist
        cursor.execute('SELECT id, email, password, name FROM admins WHERE email = ?', (data.email,))
    
    admin = cursor.fetchone()
    conn.close()
    
    if not admin:
        logger.warning(f"Admin login failed: Email not found - {data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, admin["password"]):
        logger.warning(f"Admin login failed: Invalid password for - {data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    admin_role = admin.get('role', 'admin') if 'role' in admin else 'admin'
    token = create_token(admin["id"], admin_role, admin["email"])
    logger.info(f"Admin login successful: {data.email} (Role: {admin_role})")
    
    return {
        "token": token,
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "name": admin["name"],
            "role": admin_role
        }
    }

# ============= USER ROUTES =============

@api_router.get("/user/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    logger.info(f"Profile request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT balance FROM wallets WHERE user_id = ?', (user["id"],))
    wallet = cursor.fetchone()
    
    cursor.execute('SELECT * FROM bank_accounts WHERE user_id = ?', (user["id"],))
    bank_account = cursor.fetchone()
    
    conn.close()
    
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone", ""),
        "is_verified": user["is_verified"],
        "wallet_balance": wallet["balance"] if wallet else 0,
        "bank_account": dict(bank_account) if bank_account else None
    }

@api_router.get("/user/wallet")
async def get_wallet(user: dict = Depends(get_current_user)):
    logger.info(f"Wallet request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM wallets WHERE user_id = ?', (user["id"],))
    wallet = cursor.fetchone()
    conn.close()
    
    if not wallet:
        logger.warning(f"Wallet not found for user: {user['email']}")
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    return dict(wallet)

@api_router.post("/user/bank-account")
async def create_bank_account(data: BankAccountCreate, user: dict = Depends(get_current_user)):
    logger.info(f"Bank account update: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM bank_accounts WHERE user_id = ?', (user["id"],))
    existing = cursor.fetchone()
    
    now = datetime.now(timezone.utc).isoformat()
    
    if existing:
        cursor.execute('''
        UPDATE bank_accounts 
        SET bank_name = ?, account_number = ?, account_name = ?, updated_at = ?
        WHERE user_id = ?
        ''', (
            data.bank_name,
            data.account_number,
            data.account_name,
            now,
            user["id"]
        ))
        conn.commit()
        conn.close()
        logger.info(f"Bank account updated: {user['email']}")
        return {"message": "Bank account updated successfully"}
    else:
        cursor.execute('''
        INSERT INTO bank_accounts (id, user_id, bank_name, account_number, account_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            user["id"],
            data.bank_name,
            data.account_number,
            data.account_name,
            now,
            now
        ))
        conn.commit()
        conn.close()
        logger.info(f"Bank account created: {user['email']}")
        return {"message": "Bank account added successfully"}

@api_router.get("/user/bank-account")
async def get_bank_account(user: dict = Depends(get_current_user)):
    logger.info(f"Bank account request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM bank_accounts WHERE user_id = ?', (user["id"],))
    bank_account = cursor.fetchone()
    conn.close()
    
    return dict(bank_account) if bank_account else None

# ============= INVESTMENT ROUTES =============

@api_router.get("/investments/packages")
async def get_packages():
    logger.info("Investment packages requested")
    return {"packages": INVESTMENT_PACKAGES}

@api_router.post("/investments/subscribe")
async def subscribe_to_package(data: InvestmentCreate, user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    logger.info(f"Investment subscription attempt: {user['email']} - Package: {data.package_id}")
    
    package = next((p for p in INVESTMENT_PACKAGES if p["id"] == data.package_id), None)
    if not package:
        logger.warning(f"Package not found: {data.package_id}")
        raise HTTPException(status_code=404, detail="Package not found")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT balance FROM wallets WHERE user_id = ?', (user["id"],))
    wallet = cursor.fetchone()
    
    if not wallet or wallet["balance"] < package["capital"]:
        conn.close()
        logger.warning(f"Insufficient balance: {user['email']} - Balance: {wallet['balance'] if wallet else 0}, Required: {package['capital']}")
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    # Deduct from wallet
    new_balance = wallet["balance"] - package["capital"]
    cursor.execute('UPDATE wallets SET balance = ? WHERE user_id = ?', (new_balance, user["id"]))
    
    # Create investment
    investment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    end_date = (datetime.now(timezone.utc) + timedelta(days=42)).isoformat()
    
    cursor.execute('''
    INSERT INTO investments (id, user_id, package_id, capital, daily_profit, duration, total_return, 
                           days_completed, profit_earned, status, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        investment_id,
        user["id"],
        package["id"],
        package["capital"],
        package["daily_profit"],
        package["duration"],
        package["total_return"],
        0,
        0.0,
        "active",
        now,
        end_date,
        now
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"Investment started: {user['email']} - Package: {package['capital']}")
    
    # Send investment confirmation email
    html = create_email_template(
        header="🎯 Investment Started Successfully!",
        content=f"""
        <p>Congratulations! Your investment has been successfully activated.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Package:</span>
                <span class="value">{format_currency(package['capital'])} Plan</span>
            </div>
            <div class="detail-row">
                <span class="label">Investment ID:</span>
                <span class="value">{investment_id[:8].upper()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Capital:</span>
                <span class="value amount">{format_currency(package['capital'])}</span>
            </div>
            <div class="detail-row">
                <span class="label">Daily Profit:</span>
                <span class="value amount">{format_currency(package['daily_profit'])}</span>
            </div>
            <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">{package['duration']} days</span>
            </div>
            <div class="detail-row">
                <span class="label">Total Return:</span>
                <span class="value amount">{format_currency(package['total_return'])}</span>
            </div>
            <div class="detail-row">
                <span class="label">Start Date:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d')}</span>
            </div>
            <div class="detail-row">
                <span class="label">End Date:</span>
                <span class="value">{(datetime.now(timezone.utc) + timedelta(days=42)).strftime('%Y-%m-%d')}</span>
            </div>
        </div>
        <div class="support">
            <p><strong>Important Information:</strong></p>
            <ul>
                <li>You will start earning daily profits from tomorrow</li>
                <li>Profits are calculated and added daily at midnight UTC</li>
                <li>You can track your investment progress in your dashboard</li>
                <li>Total return includes your capital plus all profits</li>
            </ul>
        </div>
        """
    )
    
    if background_tasks:
        background_tasks.add_task(send_email, user["email"], "FlexInvest - Investment Started", html)
    
    return {
        "message": "Investment started successfully",
        "investment_id": investment_id,
        "package": package
    }

@api_router.get("/investments/active")
async def get_active_investments(user: dict = Depends(get_current_user)):
    logger.info(f"Active investments request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM investments 
    WHERE user_id = ? AND status = 'active'
    ORDER BY created_at DESC
    ''', (user["id"],))
    
    investments = cursor.fetchall()
    conn.close()
    
    return {"investments": [dict(inv) for inv in investments]}

@api_router.get("/investments/history")
async def get_investment_history(user: dict = Depends(get_current_user)):
    logger.info(f"Investment history request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM investments 
    WHERE user_id = ?
    ORDER BY created_at DESC
    ''', (user["id"],))
    
    investments = cursor.fetchall()
    conn.close()
    
    return {"investments": [dict(inv) for inv in investments]}

# ============= DEPOSIT ROUTES =============

@api_router.get("/deposits/company-bank")
async def get_company_bank():
    logger.info("Company bank details requested")
    return {"bank": COMPANY_BANK}

@api_router.post("/deposits/create")
async def create_deposit(
    amount: float = Form(...),
    proof: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    logger.info(f"Deposit creation: {user['email']} - Amount: {amount}")
    
    if amount <= 0:
        logger.warning(f"Invalid deposit amount: {amount}")
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Read and encode proof image
    proof_content = await proof.read()
    proof_base64 = base64.b64encode(proof_content).decode('utf-8')
    proof_filename = proof.filename
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    deposit_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute('''
    INSERT INTO deposits (id, user_id, user_email, user_name, amount, proof_image, proof_filename, 
                         status, admin_note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        deposit_id,
        user["id"],
        user["email"],
        user["full_name"],
        amount,
        proof_base64,
        proof_filename,
        "pending",
        None,
        now,
        now
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"Deposit created: {user['email']} - ID: {deposit_id}")
    
    # Send deposit confirmation email
    html = create_email_template(
        header="💰 Deposit Request Submitted",
        content=f"""
        <p>Your deposit request has been successfully submitted.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Deposit ID:</span>
                <span class="value">{deposit_id[:8].upper()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value amount">{format_currency(amount)}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status status-pending">PENDING</span></span>
            </div>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
            </div>
        </div>
        <div class="support">
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Transfer {format_currency(amount)} to our company bank account</li>
                <li>Upload the transfer proof (already uploaded)</li>
                <li>Wait for admin approval (usually within 24 hours)</li>
                <li>Once approved, funds will be credited to your wallet</li>
            </ol>
            <p><strong>Company Bank Details:</strong></p>
            <p>Bank: {COMPANY_BANK['bank_name']}<br>
            Account Number: {COMPANY_BANK['account_number']}<br>
            Account Name: {COMPANY_BANK['account_name']}</p>
        </div>
        """
    )
    
    if background_tasks:
        background_tasks.add_task(send_email, user["email"], "FlexInvest - Deposit Request Submitted", html)
    
    return {
        "message": "Deposit request submitted successfully",
        "deposit_id": deposit_id,
        "company_bank": COMPANY_BANK
    }

@api_router.get("/deposits/history")
async def get_deposit_history(user: dict = Depends(get_current_user)):
    logger.info(f"Deposit history request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, user_id, user_email, user_name, amount, status, admin_note, created_at, updated_at
    FROM deposits 
    WHERE user_id = ?
    ORDER BY created_at DESC
    ''', (user["id"],))
    
    deposits = cursor.fetchall()
    conn.close()
    
    return {"deposits": [dict(dep) for dep in deposits]}

# ============= WITHDRAWAL ROUTES =============

@api_router.post("/withdrawals/create")
async def create_withdrawal(data: WithdrawalCreate, user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    logger.info(f"Withdrawal request: {user['email']} - Amount: {data.amount}")
    
    if data.amount <= 0:
        logger.warning(f"Invalid withdrawal amount: {data.amount}")
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM bank_accounts WHERE user_id = ?', (user["id"],))
    bank_account = cursor.fetchone()
    
    if not bank_account:
        conn.close()
        logger.warning(f"No bank account found for: {user['email']}")
        raise HTTPException(status_code=400, detail="Please add a bank account first")
    
    cursor.execute('SELECT balance FROM wallets WHERE user_id = ?', (user["id"],))
    wallet = cursor.fetchone()
    
    if not wallet or wallet["balance"] < data.amount:
        conn.close()
        logger.warning(f"Insufficient balance for withdrawal: {user['email']} - Balance: {wallet['balance'] if wallet else 0}, Requested: {data.amount}")
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    withdrawal_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute('''
    INSERT INTO withdrawals (id, user_id, user_email, user_name, amount, bank_name, account_number, 
                            account_name, status, admin_note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        withdrawal_id,
        user["id"],
        user["email"],
        user["full_name"],
        data.amount,
        bank_account["bank_name"],
        bank_account["account_number"],
        bank_account["account_name"],
        "pending",
        None,
        now,
        now
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"Withdrawal created: {user['email']} - ID: {withdrawal_id}")
    
    # Send withdrawal request email
    html = create_email_template(
        header="💳 Withdrawal Request Submitted",
        content=f"""
        <p>Your withdrawal request has been successfully submitted.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Withdrawal ID:</span>
                <span class="value">{withdrawal_id[:8].upper()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value amount">{format_currency(data.amount)}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status status-pending">PENDING</span></span>
            </div>
            <div class="detail-row">
                <span class="label">Bank Account:</span>
                <span class="value">{bank_account['bank_name']} - {bank_account['account_number']}</span>
            </div>
            <div class="detail-row">
                <span class="label">Account Name:</span>
                <span class="value">{bank_account['account_name']}</span>
            </div>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
            </div>
        </div>
        <div class="support">
            <p><strong>Processing Time:</strong></p>
            <ul>
                <li>Withdrawal requests are processed within 24-48 hours</li>
                <li>You will receive an email notification once processed</li>
                <li>Funds will be transferred to your bank account after approval</li>
                <li>If rejected, your wallet balance will remain unchanged</li>
            </ul>
        </div>
        """
    )
    
    if background_tasks:
        background_tasks.add_task(send_email, user["email"], "FlexInvest - Withdrawal Request Submitted", html)
    
    return {
        "message": "Withdrawal request submitted successfully",
        "withdrawal_id": withdrawal_id
    }

@api_router.get("/withdrawals/history")
async def get_withdrawal_history(user: dict = Depends(get_current_user)):
    logger.info(f"Withdrawal history request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM withdrawals 
    WHERE user_id = ?
    ORDER BY created_at DESC
    ''', (user["id"],))
    
    withdrawals = cursor.fetchall()
    conn.close()
    
    return {"withdrawals": [dict(w) for w in withdrawals]}

# ============= COMPLAINT ROUTES =============

@api_router.post("/complaints/create")
async def create_complaint(data: ComplaintCreate, user: dict = Depends(get_current_user), background_tasks: BackgroundTasks = None):
    logger.info(f"Complaint creation: {user['email']} - Subject: {data.subject[:50]}...")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    complaint_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute('''
    INSERT INTO complaints (id, user_id, user_email, user_name, subject, message, 
                           status, admin_response, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        complaint_id,
        user["id"],
        user["email"],
        user["full_name"],
        data.subject,
        data.message,
        "open",
        None,
        now,
        now
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"Complaint created: {user['email']} - ID: {complaint_id}")
    
    # Send complaint confirmation email
    html = create_email_template(
        header="📝 Complaint Submitted",
        content=f"""
        <p>Your complaint has been successfully submitted to our support team.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Complaint ID:</span>
                <span class="value">{complaint_id[:8].upper()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Subject:</span>
                <span class="value">{data.subject}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status status-open">OPEN</span></span>
            </div>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
            </div>
        </div>
        <div class="support">
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Our support team will review your complaint</li>
                <li>You will receive a response via email within 24-48 hours</li>
                <li>You can track the status in your dashboard</li>
            </ul>
            <p>For urgent matters, you can contact us through our support channels:</p>
            <p>WhatsApp: +2348012345678<br>
            Telegram: @flexinvest_support<br>
            Email: support@flexinvest.com</p>
        </div>
        """
    )
    
    if background_tasks:
        background_tasks.add_task(send_email, user["email"], "FlexInvest - Complaint Submitted", html)
    
    return {
        "message": "Complaint submitted successfully",
        "complaint_id": complaint_id
    }

@api_router.get("/complaints/history")
async def get_complaint_history(user: dict = Depends(get_current_user)):
    logger.info(f"Complaint history request: {user['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM complaints 
    WHERE user_id = ?
    ORDER BY created_at DESC
    ''', (user["id"],))
    
    complaints = cursor.fetchall()
    conn.close()
    
    return {"complaints": [dict(c) for c in complaints]}

@api_router.get("/support/links")
async def get_support_links():
    logger.info("Support links requested")
    return {"links": SUPPORT_LINKS}

# ============= ADMIN ENDPOINTS =============

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(get_current_admin)):
    logger.info(f"Admin dashboard request: {admin['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Count queries
    cursor.execute('SELECT COUNT(*) as count FROM users')
    total_users = cursor.fetchone()["count"]
    
    cursor.execute('SELECT COUNT(*) as count FROM deposits WHERE status = ?', ("pending",))
    pending_deposits = cursor.fetchone()["count"]
    
    cursor.execute('SELECT COUNT(*) as count FROM withdrawals WHERE status = ?', ("pending",))
    pending_withdrawals = cursor.fetchone()["count"]
    
    cursor.execute('SELECT COUNT(*) as count FROM complaints WHERE status = ?', ("open",))
    open_complaints = cursor.fetchone()["count"]
    
    cursor.execute('SELECT COUNT(*) as count FROM investments WHERE status = ?', ("active",))
    active_investments = cursor.fetchone()["count"]
    
    # Sum queries
    cursor.execute('SELECT SUM(amount) as total FROM deposits WHERE status = ?', ("approved",))
    total_deposited = cursor.fetchone()["total"] or 0
    
    cursor.execute('SELECT SUM(amount) as total FROM withdrawals WHERE status = ?', ("approved",))
    total_withdrawn = cursor.fetchone()["total"] or 0
    
    conn.close()
    
    return {
        "total_users": total_users,
        "pending_deposits": pending_deposits,
        "pending_withdrawals": pending_withdrawals,
        "open_complaints": open_complaints,
        "active_investments": active_investments,
        "total_deposited": total_deposited,
        "total_withdrawn": total_withdrawn
    }

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_current_admin)):
    """Get all users for admin panel"""
    logger.info(f"Admin users request: {admin['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, email, full_name, phone, is_verified, created_at 
    FROM users 
    ORDER BY created_at DESC
    ''')
    
    users = cursor.fetchall()
    
    # Add wallet balance to each user
    result_users = []
    for user in users:
        cursor.execute('SELECT balance FROM wallets WHERE user_id = ?', (user["id"],))
        wallet = cursor.fetchone()
        
        user_dict = dict(user)
        user_dict["wallet_balance"] = wallet["balance"] if wallet else 0
        result_users.append(user_dict)
    
    conn.close()
    
    return {"users": result_users}

@api_router.get("/admin/deposits")
async def admin_get_deposits(admin: dict = Depends(get_current_admin)):
    """Get all deposits for admin panel"""
    logger.info(f"Admin deposits request: {admin['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, user_id, user_email, user_name, amount, status, 
           admin_note, created_at, updated_at
    FROM deposits 
    ORDER BY created_at DESC
    ''')
    
    deposits = cursor.fetchall()
    conn.close()
    
    return {"deposits": [dict(dep) for dep in deposits]}

@api_router.get("/admin/deposits/{deposit_id}/proof")
async def admin_get_deposit_proof(deposit_id: str, admin: dict = Depends(get_current_admin)):
    """Get deposit proof image"""
    logger.info(f"Admin deposit proof request: {admin['email']} - Deposit: {deposit_id}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT proof_image, proof_filename FROM deposits WHERE id = ?', (deposit_id,))
    deposit = cursor.fetchone()
    conn.close()
    
    if not deposit:
        logger.warning(f"Deposit not found: {deposit_id}")
        raise HTTPException(status_code=404, detail="Deposit not found")
    
    return {"proof_image": deposit["proof_image"], "filename": deposit["proof_filename"]}

@api_router.put("/admin/deposits/{deposit_id}")
async def admin_update_deposit(deposit_id: str, data: AdminApproval, admin: dict = Depends(get_current_admin), background_tasks: BackgroundTasks = None):
    """Approve or reject a deposit"""
    logger.info(f"Admin deposit update: {admin['email']} - Deposit: {deposit_id} - Status: {data.status}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM deposits WHERE id = ?', (deposit_id,))
    deposit = cursor.fetchone()
    
    if not deposit:
        conn.close()
        logger.warning(f"Deposit not found for update: {deposit_id}")
        raise HTTPException(status_code=404, detail="Deposit not found")
    
    if deposit["status"] != "pending":
        conn.close()
        logger.warning(f"Deposit already processed: {deposit_id} - Status: {deposit['status']}")
        raise HTTPException(status_code=400, detail="Deposit already processed")
    
    now = datetime.now(timezone.utc).isoformat()
    
    try:
        cursor.execute('''
        UPDATE deposits 
        SET status = ?, admin_note = ?, updated_at = ?
        WHERE id = ?
        ''', (
            data.status,
            data.reason,
            now,
            deposit_id
        ))
        
        if data.status == "approved":
            # Credit user wallet
            cursor.execute('''
            UPDATE wallets 
            SET balance = balance + ?
            WHERE user_id = ?
            ''', (deposit["amount"], deposit["user_id"]))
        
        conn.commit()
        logger.info(f"Deposit {data.status}: {deposit_id} - User: {deposit['user_email']}")
        
        # Send notification email to user
        status_class = "approved" if data.status == "approved" else "rejected"
        
        html = create_email_template(
            header=f"Deposit {data.status.capitalize()}",
            content=f"""
            <p>Your deposit request has been <span class="status status-{status_class}">{data.status}</span></p>
            <div class="details">
                <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="value amount">{format_currency(deposit['amount'])}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status status-{status_class}">{data.status.upper()}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
                </div>
                {f'<div class="detail-row"><span class="label">Note:</span><span class="value">{data.reason or "No note provided"}</span></div>' if data.reason else ''}
            </div>
            {'''
            <div class="support">
                <p>Your wallet has been credited with the deposit amount. You can now start investing!</p>
            </div>
            ''' if data.status == "approved" else '''
            <div class="warning">
                <p>Your deposit was not approved. Please contact support if you have questions.</p>
            </div>
            '''}
            """
        )
        
        email_subject = f"FlexInvest - Deposit {data.status.capitalize()}"
        if background_tasks:
            background_tasks.add_task(send_email, deposit["user_email"], email_subject, html)
        
        return {"message": f"Deposit {data.status}"}
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating deposit {deposit_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@api_router.get("/admin/withdrawals")
async def admin_get_withdrawals(admin: dict = Depends(get_current_admin)):
    """Get all withdrawals for admin panel"""
    logger.info(f"Admin withdrawals request: {admin['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM withdrawals 
    ORDER BY created_at DESC
    ''')
    
    withdrawals = cursor.fetchall()
    conn.close()
    
    return {"withdrawals": [dict(w) for w in withdrawals]}

@api_router.put("/admin/withdrawals/{withdrawal_id}")
async def admin_update_withdrawal(withdrawal_id: str, data: AdminApproval, admin: dict = Depends(get_current_admin), background_tasks: BackgroundTasks = None):
    """Approve or reject a withdrawal"""
    logger.info(f"Admin withdrawal update: {admin['email']} - Withdrawal: {withdrawal_id} - Status: {data.status}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM withdrawals WHERE id = ?', (withdrawal_id,))
    withdrawal = cursor.fetchone()
    
    if not withdrawal:
        conn.close()
        logger.warning(f"Withdrawal not found for update: {withdrawal_id}")
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    
    if withdrawal["status"] != "pending":
        conn.close()
        logger.warning(f"Withdrawal already processed: {withdrawal_id} - Status: {withdrawal['status']}")
        raise HTTPException(status_code=400, detail="Withdrawal already processed")
    
    now = datetime.now(timezone.utc).isoformat()
    
    try:
        cursor.execute('''
        UPDATE withdrawals 
        SET status = ?, admin_note = ?, updated_at = ?
        WHERE id = ?
        ''', (
            data.status,
            data.reason,
            now,
            withdrawal_id
        ))
        
        if data.status == "approved":
            # Deduct from wallet
            cursor.execute('''
            UPDATE wallets 
            SET balance = balance - ?
            WHERE user_id = ?
            ''', (withdrawal["amount"], withdrawal["user_id"]))
        
        conn.commit()
        logger.info(f"Withdrawal {data.status}: {withdrawal_id} - User: {withdrawal['user_email']}")
        
        # Send notification email to user
        status_class = "approved" if data.status == "approved" else "rejected"
        
        html = create_email_template(
            header=f"Withdrawal {data.status.capitalize()}",
            content=f"""
            <p>Your withdrawal request has been <span class="status status-{status_class}">{data.status}</span></p>
            <div class="details">
                <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="value amount">{format_currency(withdrawal['amount'])}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Bank Account:</span>
                    <span class="value">{withdrawal['bank_name']} - {withdrawal['account_number']}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status status-{status_class}">{data.status.upper()}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
                </div>
                {f'<div class="detail-row"><span class="label">Note:</span><span class="value">{data.reason or "No note provided"}</span></div>' if data.reason else ''}
            </div>
            {'''
            <div class="support">
                <p>The funds will be transferred to your bank account within 24 hours.</p>
                <p>If you don't receive the funds within this period, please contact our support team.</p>
            </div>
            ''' if data.status == "approved" else '''
            <div class="warning">
                <p>Your withdrawal was not approved. Your wallet balance remains unchanged.</p>
                <p>Please contact support if you have questions.</p>
            </div>
            '''}
            """
        )
        
        email_subject = f"FlexInvest - Withdrawal {data.status.capitalize()}"
        if background_tasks:
            background_tasks.add_task(send_email, withdrawal["user_email"], email_subject, html)
        
        return {"message": f"Withdrawal {data.status}"}
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating withdrawal {withdrawal_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@api_router.get("/admin/complaints")
async def admin_get_complaints(admin: dict = Depends(get_current_admin)):
    """Get all complaints for admin panel"""
    logger.info(f"Admin complaints request: {admin['email']}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM complaints 
    ORDER BY created_at DESC
    ''')
    
    complaints = cursor.fetchall()
    conn.close()
    
    return {"complaints": [dict(c) for c in complaints]}

@api_router.put("/admin/complaints/{complaint_id}")
async def admin_update_complaint(complaint_id: str, status: str, response: Optional[str] = None, admin: dict = Depends(get_current_admin), background_tasks: BackgroundTasks = None):
    """Update complaint status and response"""
    logger.info(f"Admin complaint update: {admin['email']} - Complaint: {complaint_id} - Status: {status}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM complaints WHERE id = ?', (complaint_id,))
    complaint = cursor.fetchone()
    
    if not complaint:
        conn.close()
        logger.warning(f"Complaint not found: {complaint_id}")
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute('''
    UPDATE complaints 
    SET status = ?, admin_response = ?, updated_at = ?
    WHERE id = ?
    ''', (status, response, now, complaint_id))
    
    conn.commit()
    conn.close()
    
    # Send notification email to user
    if background_tasks and response:
        html = create_email_template(
            header="Complaint Update",
            content=f"""
            <p>Your complaint has been updated by our support team.</p>
            <div class="details">
                <div class="detail-row">
                    <span class="label">Subject:</span>
                    <span class="value">{complaint['subject']}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status status-{status.lower()}">{status.upper()}</span>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Response Date:</span>
                    <span class="value">{now}</span>
                </div>
            </div>
            <div class="support">
                <p><strong>Support Response:</strong></p>
                <p>{response}</p>
            </div>
            """
        )
        background_tasks.add_task(send_email, complaint["user_email"], "FlexInvest - Complaint Update", html)
    
    return {"message": "Complaint updated"}

@api_router.post("/admin/credit-wallet")
async def admin_credit_wallet(data: WalletCredit, admin: dict = Depends(get_current_admin), background_tasks: BackgroundTasks = None):
    """Admin credit user wallet"""
    logger.info(f"Admin credit wallet: {admin['email']} - User: {data.user_id} - Amount: {data.amount}")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT email, full_name FROM users WHERE id = ?', (data.user_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        logger.warning(f"User not found for wallet credit: {data.user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute('''
    UPDATE wallets 
    SET balance = balance + ?
    WHERE user_id = ?
    ''', (data.amount, data.user_id))
    
    conn.commit()
    conn.close()
    logger.info(f"Wallet credited: User {user['email']} - Amount: {data.amount}")
    
    # Send notification email to user
    html = create_email_template(
        header="Wallet Credited",
        content=f"""
        <p>Your wallet has been credited with a new amount.</p>
        <div class="details">
            <div class="detail-row">
                <span class="label">Amount Credited:</span>
                <span class="value amount">{format_currency(data.amount)}</span>
            </div>
            <div class="detail-row">
                <span class="label">Reason:</span>
                <span class="value">{data.reason}</span>
            </div>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</span>
            </div>
        </div>
        <div class="support">
            <p>You can now use these funds to invest in any of our packages.</p>
            <p>If you have any questions about this transaction, please contact our support team.</p>
        </div>
        """
    )
    
    if background_tasks:
        background_tasks.add_task(send_email, user["email"], "FlexInvest - Wallet Credited", html)
    
    return {"message": "Wallet credited successfully"}

# ============= DEBUG ENDPOINTS =============

@api_router.get("/debug/admins")
async def debug_admins():
    """Debug endpoint to list all admins"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, email, name, role, created_at FROM admins')
    except sqlite3.OperationalError:
        # If role column doesn't exist
        cursor.execute('SELECT id, email, name, created_at FROM admins')
    
    admins = cursor.fetchall()
    conn.close()
    
    return {"admins": [dict(admin) for admin in admins]}

@api_router.get("/debug/users")
async def debug_users():
    """Debug endpoint to list all users"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, full_name, is_verified, created_at FROM users')
    users = cursor.fetchall()
    conn.close()
    
    return {"users": [dict(user) for user in users]}

# ============= HEALTH CHECK =============

@api_router.get("/health")
async def health_check():
    # Check database connection
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        db_status = "connected"
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"
        logger.error(f"Database health check failed: {e}")
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

# ============= DAILY PROFIT PROCESSING =============

async def process_daily_profits():
    """Process daily profits for all active investments"""
    logger.info("Processing daily profits...")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM investments WHERE status = ?', ("active",))
        active_investments = cursor.fetchall()
        
        logger.info(f"Found {len(active_investments)} active investments")
        
        for investment in active_investments:
            days_completed = investment["days_completed"] + 1
            profit_earned = investment["profit_earned"] + investment["daily_profit"]
            
            if days_completed >= investment["duration"]:
                # Investment completed
                cursor.execute('''
                UPDATE investments 
                SET days_completed = ?, profit_earned = ?, status = ?
                WHERE id = ?
                ''', (
                    days_completed,
                    profit_earned,
                    "completed",
                    investment["id"]
                ))
                
                # Credit total return to wallet
                total_return = investment["capital"] + profit_earned
                cursor.execute('''
                UPDATE wallets 
                SET balance = balance + ?
                WHERE user_id = ?
                ''', (total_return, investment["user_id"]))
                
                logger.info(f"Investment {investment['id']} completed. Credited {total_return} to user {investment['user_id']}")
                
                # Send completion email
                cursor.execute('SELECT email, full_name FROM users WHERE id = ?', (investment["user_id"],))
                user = cursor.fetchone()
                if user:
                    html = create_email_template(
                        header="🎉 Investment Completed!",
                        content=f"""
                        <p>Congratulations! Your investment has been successfully completed.</p>
                        <div class="details">
                            <div class="detail-row">
                                <span class="label">Total Capital:</span>
                                <span class="value amount">{format_currency(investment['capital'])}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Profits Earned:</span>
                                <span class="value amount">{format_currency(profit_earned)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Return:</span>
                                <span class="value amount">{format_currency(total_return)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Duration:</span>
                                <span class="value">{investment['duration']} days</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Completed Date:</span>
                                <span class="value">{datetime.now(timezone.utc).strftime('%Y-%m-%d')}</span>
                            </div>
                        </div>
                        <div class="support">
                            <p>The total return amount of {format_currency(total_return)} has been credited to your wallet.</p>
                            <p>You can now withdraw these funds or reinvest them in a new package.</p>
                        </div>
                        """
                    )
                    # FIXED: Use background_tasks pattern instead of asyncio.create_task
                    try:
                        asyncio.create_task(send_email(user["email"], "FlexInvest - Investment Completed", html))
                    except Exception as e:
                        logger.error(f"Failed to create email task for investment completion: {e}")
            else:
                cursor.execute('''
                UPDATE investments 
                SET days_completed = ?, profit_earned = ?
                WHERE id = ?
                ''', (
                    days_completed,
                    profit_earned,
                    investment["id"]
                ))
                logger.info(f"Investment {investment['id']} day {days_completed} processed. Profit earned: {profit_earned}")
        
        conn.commit()
        logger.info("Daily profit processing completed")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error processing daily profits: {e}")
    finally:
        conn.close()

# ============= LIFESPAN MANAGEMENT =============

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FlexInvest API...")
    
    # Start scheduler for daily profit processing
    scheduler.add_job(process_daily_profits, 'cron', hour=0, minute=0)  # Run at midnight
    scheduler.start()
    logger.info("Scheduler started for daily profit processing")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    logger.info("Shutting down FlexInvest API...")

# ============= CREATE FASTAPI APP =============

app = FastAPI(title="FlexInvest API", lifespan=lifespan)


# CORS Configuration
# origins = [
#     "http://localhost:3000",
#     "http://localhost:5173",
#     "http://127.0.0.1:3000",
#     "http://127.0.0.1:5173",
#     "http://localhost:8080",
#     "http://127.0.0.1:8080",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
#     allow_headers=[
#         "*",
#         "Authorization",
#         "Content-Type",
#         "Accept",
#         "Origin",
#         "X-Requested-With",
#         "Access-Control-Allow-Headers",
#         "Access-Control-Allow-Origin"
#     ],
#     expose_headers=["*"],
#     max_age=3600,
# )

# CORS Configuration
# Read origins from env and normalize to include scheme if missing
cors_origins_str = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
raw_origins = [o.strip() for o in cors_origins_str.split(',') if o.strip()]

def _normalize_origin(o: str) -> str:
    if o.startswith('http://') or o.startswith('https://'):
        return o
    return f'http://{o}'

origins = [_normalize_origin(o) for o in raw_origins]
# Ensure known production hosts are included
origins += [
    'https://app.isquaredcapital.com.ng',
    'https://isquaredcapital.com.ng'
]

logger.info(f"Configured CORS origins: {origins}")

# Debug middleware to log incoming Origin header and response CORS header
@app.middleware("http")
async def _log_request_origin(request, call_next):
    origin = request.headers.get('origin')
    if origin:
        logger.info(f"Incoming request Origin: {origin}")
    response = await call_next(request)
    acao = response.headers.get('access-control-allow-origin')
    if acao:
        logger.info(f"Response Access-Control-Allow-Origin: {acao}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# Include router
app.include_router(api_router)

# ============= MAIN ENTRY POINT =============

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FlexInvest API server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)