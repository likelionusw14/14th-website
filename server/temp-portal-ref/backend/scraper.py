import requests
import urllib3
import ssl
from requests.adapters import HTTPAdapter
import json
import re
from urllib.parse import urljoin

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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

class SuwonPortalScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.verify = False
        self.session.mount('https://', LegacySSLAdapter())
        self.base_headers = {
            "Accept": "application/json",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Connection": "keep-alive",
            # "Content-Type" will be set by json=... but good to have default
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
            "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "submissionid": "sub"
        }
        self.session.headers.update(self.base_headers)
        self.user_id = None

    def login(self, user_id, password):
        self.user_id = user_id
        
        # 1. Fetch Portal Page
        portal_url = "https://portal.suwon.ac.kr/enview/index.jsp"
        try:
            self.session.get(portal_url)
        except Exception as e:
            raise Exception(f"Failed to fetch portal page: {e}")

        # 2. Login Action
        login_url = "https://portal.suwon.ac.kr/enpass/login?_epLogin_=enview&service=https://portal.suwon.ac.kr/enview/user/enpassLoginProcess.face?destination=/enview/portal/?langKnd=ko"
        login_data = {
            "userId": user_id,
            "pwd": password,
            "langKnd": "ko",
            "_enpass_login_": "submit",
            "gateway": "true",
            "username": user_id,
            "password": password
        }
        
        resp = self.session.post(login_url, data=login_data)
        
        # 3. SSO Handoff
        sso_base_url = "https://portal.suwon.ac.kr/enview/user/mainLogin.face"
        sso_params = {"url": "https://info.suwon.ac.kr/sso_security_check", "langKnd": "ko"}
        sso_resp = self.session.get(sso_base_url, params=sso_params)
        
        # Handle JS redirect if present
        loc_match = re.search(r'location\.href\s*=\s*["\']([^"\']+)["\']', sso_resp.text)
        if loc_match:
            redirect_url = loc_match.group(1)
            full_redirect_url = urljoin(sso_resp.url, redirect_url)
            self.session.get(full_redirect_url)
            
        return True

    def _safe_json_request(self, url, data, headers):
        try:
            resp = self.session.post(url, json=data, headers=headers)
            return resp.json()
        except Exception as e:
            return {}

    def get_personal_info(self):
        url = 'https://info.suwon.ac.kr/scrgBas/selectScrgBas.do'
        headers = {
            'Content-Type': 'application/json; charset="UTF-8"',
            'Origin': 'https://info.suwon.ac.kr',
            'Referer': 'https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot='
        }
        data = {"sno": self.user_id}
        return self._safe_json_request(url, data, headers)

    def get_semesters(self):
        url = 'https://info.suwon.ac.kr/atlecApplDtai/listAtlecApplDtaiTabYearSmr.do'
        headers = {
            'Content-Type': 'application/json; charset="UTF-8"',
            'Origin': 'https://info.suwon.ac.kr',
            'Referer': 'https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot='
        }
        data = {"sno": self.user_id}
        return self._safe_json_request(url, data, headers)
        
    def get_credits(self):
        url = 'https://info.suwon.ac.kr/smrCretSum/listSmrCretSumTabYearSmrStud.do'
        headers = {
            'Content-Type': 'application/json; charset="UTF-8"',
            'Origin': 'https://info.suwon.ac.kr',
            'Referer': 'https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot='
        }
        data = {"sno": self.user_id}
        return self._safe_json_request(url, data, headers)

    def get_grades_detail(self, year, semester_code):
        url = "https://info.suwon.ac.kr/cretBas/listSmrCretSumTabSubjt.do"
        headers = {
            'Content-Type': 'application/json; charset="UTF-8"',
            'Origin': 'https://info.suwon.ac.kr',
            'Referer': 'https://info.suwon.ac.kr/websquare/websquare.jsp?w2xPath=/views/usw/sa/hj/SA_HJ_1230.xml&w2xHome=/views/&w2xDocumentRoot='
        }
        data = {"sno": self.user_id, "cretGainYear": year, "cretSmrCd": semester_code}
        return self._safe_json_request(url, data, headers)

    def get_all_data(self):
        personal = self.get_personal_info()
        semesters = self.get_semesters()
        credits_summary = self.get_credits()
        
        data = {
            "personal": personal,
            "semesters": semesters,
            "credits_summary": credits_summary,
            "details": []
        }
        
        return data
