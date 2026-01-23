import requests
import sys
import json
import time
from datetime import datetime
import base64
import io
from PIL import Image

class FlexInvestAPITester:
    def __init__(self, base_url="https://flexinvest-portal.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{int(time.time())}@example.com"
        self.test_user_data = {
            "email": self.test_user_email,
            "password": "TestPass123!",
            "full_name": "Test User",
            "phone": "08012345678"
        }
        self.admin_credentials = {
            "email": "admin@flexinvest.com",
            "password": "Admin123!"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_image(self):
        """Create a test image for upload"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_investment_packages(self):
        """Test getting investment packages"""
        return self.run_test("Get Investment Packages", "GET", "investments/packages", 200)

    def test_company_bank_details(self):
        """Test getting company bank details"""
        return self.run_test("Get Company Bank Details", "GET", "deposits/company-bank", 200)

    def test_support_links(self):
        """Test getting support links"""
        return self.run_test("Get Support Links", "GET", "support/links", 200)

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=self.test_user_data
        )
        return success, response

    def test_user_login_without_verification(self):
        """Test user login without email verification"""
        success, response = self.run_test(
            "User Login (Unverified)",
            "POST",
            "auth/login",
            403,  # Should fail because email not verified
            data={"email": self.test_user_email, "password": "TestPass123!"}
        )
        return success, response

    def test_resend_otp(self):
        """Test resending OTP"""
        success, response = self.run_test(
            "Resend OTP",
            "POST",
            "auth/resend-otp",
            200,
            data={"email": self.test_user_email}
        )
        return success, response

    def test_verify_otp_invalid(self):
        """Test OTP verification with invalid OTP"""
        success, response = self.run_test(
            "Verify OTP (Invalid)",
            "POST",
            "auth/verify-otp",
            400,  # Should fail with invalid OTP
            data={"email": self.test_user_email, "otp": "123456"}
        )
        return success, response

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data=self.admin_credentials
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True, response
        return False, {}

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if not self.admin_token:
            print("❌ Admin token not available")
            return False, {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Dashboard",
            "GET",
            "admin/dashboard",
            200,
            headers=headers
        )

    def test_admin_users(self):
        """Test admin users list"""
        if not self.admin_token:
            print("❌ Admin token not available")
            return False, {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Users List",
            "GET",
            "admin/users",
            200,
            headers=headers
        )

    def test_admin_deposits(self):
        """Test admin deposits list"""
        if not self.admin_token:
            print("❌ Admin token not available")
            return False, {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Deposits List",
            "GET",
            "admin/deposits",
            200,
            headers=headers
        )

    def test_admin_withdrawals(self):
        """Test admin withdrawals list"""
        if not self.admin_token:
            print("❌ Admin token not available")
            return False, {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Withdrawals List",
            "GET",
            "admin/withdrawals",
            200,
            headers=headers
        )

    def test_admin_complaints(self):
        """Test admin complaints list"""
        if not self.admin_token:
            print("❌ Admin token not available")
            return False, {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Complaints List",
            "GET",
            "admin/complaints",
            200,
            headers=headers
        )

    def test_user_endpoints_without_auth(self):
        """Test user endpoints without authentication"""
        endpoints = [
            ("user/profile", "GET"),
            ("user/wallet", "GET"),
            ("user/bank-account", "GET"),
            ("investments/active", "GET"),
            ("investments/history", "GET"),
            ("deposits/history", "GET"),
            ("withdrawals/history", "GET"),
            ("complaints/history", "GET")
        ]
        
        results = []
        for endpoint, method in endpoints:
            success, _ = self.run_test(
                f"Unauthorized {endpoint}",
                method,
                endpoint,
                403  # FastAPI returns 403 for unauthenticated requests
            )
            results.append(success)
        
        return all(results)

    def test_invalid_endpoints(self):
        """Test invalid endpoints"""
        success, _ = self.run_test(
            "Invalid Endpoint",
            "GET",
            "invalid/endpoint",
            404
        )
        return success

def main():
    print("🚀 Starting FlexInvest API Testing...")
    print("=" * 60)
    
    tester = FlexInvestAPITester()
    
    # Test public endpoints first
    print("\n📋 Testing Public Endpoints...")
    tester.test_health_check()
    tester.test_investment_packages()
    tester.test_company_bank_details()
    tester.test_support_links()
    
    # Test authentication flow
    print("\n🔐 Testing Authentication Flow...")
    tester.test_user_registration()
    tester.test_user_login_without_verification()
    tester.test_resend_otp()
    tester.test_verify_otp_invalid()
    
    # Test admin authentication
    print("\n👑 Testing Admin Authentication...")
    admin_login_success, _ = tester.test_admin_login()
    
    if admin_login_success:
        print("\n📊 Testing Admin Endpoints...")
        tester.test_admin_dashboard()
        tester.test_admin_users()
        tester.test_admin_deposits()
        tester.test_admin_withdrawals()
        tester.test_admin_complaints()
    else:
        print("❌ Admin login failed, skipping admin endpoint tests")
    
    # Test unauthorized access
    print("\n🚫 Testing Unauthorized Access...")
    tester.test_user_endpoints_without_auth()
    
    # Test invalid endpoints
    print("\n❓ Testing Invalid Endpoints...")
    tester.test_invalid_endpoints()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API testing completed successfully!")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())