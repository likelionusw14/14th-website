import requests
import urllib3
import json
import os

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration - Load from environment variables
USER_ID = os.environ.get("PORTAL_USER_ID", "")
PASSWORD = os.environ.get("PORTAL_PASSWORD", "")
# Confirmed login action URL
PORTAL_URL = "https://portal.suwon.ac.kr/enview/index.jsp"
LOGIN_ACTION_URL = "https://portal.suwon.ac.kr/enpass/login?_epLogin_=enview&service=https://portal.suwon.ac.kr/enview/user/enpassLoginProcess.face?destination=/enview/portal/?langKnd=ko"
GRADES_URL = "https://info.suwon.ac.kr/smrCretSum/listSmrCretSumTabYearSmrStud.do"

import ssl
from requests.adapters import HTTPAdapter

def get_grades():
    session = requests.Session()
    session.verify = False
    
    # Create a custom SSL adapter to allow legacy DH keys
    class LegacySSLAdapter(HTTPAdapter):
        def init_poolmanager(self, connections, maxsize, block=False):
            ctx = ssl.create_default_context()
            ctx.set_ciphers('DEFAULT@SECLEVEL=1')
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            self.poolmanager = urllib3.poolmanager.PoolManager(
                num_pools=connections, maxsize=maxsize,
                block=block, ssl_context=ctx
            )
            
    session.mount('https://', LegacySSLAdapter())

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    session.headers.update(headers)


    print("[-] fetching portal page to initialize session...")
    try:
        response = session.get(PORTAL_URL)
        response.raise_for_status()
    except Exception as e:
        print(f"[!] Failed to fetch portal page: {e}")
        return

    print("[-] Logging in...")
    login_data = {
        "userId": USER_ID,
        "pwd": PASSWORD,
        "langKnd": "ko",
        # Hidden fields required by Enpass
        "_enpass_login_": "submit",
        "gateway": "true",
        "username": USER_ID,
        "password": PASSWORD
    }
    
    try:
        login_response = session.post(LOGIN_ACTION_URL, data=login_data)
        login_response.raise_for_status()
        
        # Check cookies to see if we have JSESSIONID or similar indicating success
        print("Cookies after login:", session.cookies.get_dict())
        for cookie in session.cookies:
            print(f"Cookie: {cookie.name}, Domain: {cookie.domain}, Path: {cookie.path}")
            
        # Inspect response for redirection content
        if "location.replace" in login_response.text or "window.location" in login_response.text:
            print("Login response contains redirect script.")
            # print(login_response.text[:500]) # Print first 500 chars

        if "logout" in login_response.text.lower() or "로그아웃" in login_response.text:
             print("[+] Login successful to Portal.")
        else:
             print("[?] Portal login status uncertain, proceeding anyway...")
             
        # Perform SSO handoff to Info System
        print("[-] Performing SSO handoff to info system...")
        SSO_BASE_URL = "https://portal.suwon.ac.kr/enview/user/mainLogin.face"
        sso_params = {
            "url": "https://info.suwon.ac.kr/sso_security_check",
            "langKnd": "ko"
        }
        
        # Request SSO handoff. 
        # Note: This often redirects or returns a page with JS. 
        # In this case, even if it redirects to an unexpected page (like ajaxJoin.face), 
        # it seems the necessary session cookies for info.suwon.ac.kr are established or 
        # the session is propagated.
        sso_response = session.get(SSO_BASE_URL, params=sso_params)
        
        # Optional: Resolve relative redirects if the server uses JS verification
        # (This block was useful for debugging but might be optional if requests are working)
        import re
        loc_match = re.search(r'location\.href\s*=\s*["\']([^"\']+)["\']', sso_response.text)
        if loc_match:
            redirect_url = loc_match.group(1)
            from urllib.parse import urljoin
            full_redirect_url = urljoin(sso_response.url, redirect_url)
            session.get(full_redirect_url)
            
    except Exception as e:
        print(f"[!] Login/SSO failed: {e}")
        return

    print("[-] Fetching grades...")
    # Based on the curl command provided by user
    grade_payload = {"sno": USER_ID}
    
    # Specific headers for the grade request as per user's curl
    grade_headers = {
        "Content-Type": "application/json; charset=UTF-8",
        "Accept": "application/json",
        "Origin": "https://info.suwon.ac.kr",
        "Referer": "https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot=",
    }
    
    try:
        grade_response = session.post(GRADES_URL, json=grade_payload, headers=grade_headers)
        grade_response.raise_for_status()
        
        print("\n[Grades Response]")
        print(json.dumps(grade_response.json(), indent=2, ensure_ascii=False))

        
    except Exception as e:
        print(f"[!] Failed to fetch grades: {e}")
        print(f"Response content: {grade_response.text if 'grade_response' in locals() else 'N/A'}")

if __name__ == "__main__":
    if not USER_ID or not PASSWORD:
        print("[!] Error: PORTAL_USER_ID and PORTAL_PASSWORD environment variables must be set")
        print("    Example: PORTAL_USER_ID=12345678 PORTAL_PASSWORD=mypass python get_grades.py")
        exit(1)
    get_grades()
