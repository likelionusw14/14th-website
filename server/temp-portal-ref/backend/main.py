from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from scraper import SuwonPortalScraper
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Get allowed origins from environment variable, default to wildcard for development
cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
allowed_origins = cors_origins_env.split(",") if cors_origins_env != "*" else ["*"]

# CORS 설정 개선: 환경 변수가 없거나 "*"인 경우 모든 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if cors_origins_env != "*" else ["*"],
    allow_origin_regex=r".*" if cors_origins_env == "*" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(req: LoginRequest):
    logger.info(f"CORS_ORIGINS env: {os.environ.get('CORS_ORIGINS', 'not set')}")
    logger.info(f"Allowed origins: {allowed_origins}")

    scraper = SuwonPortalScraper()
    try:
        logger.info("Attempting login...")
        success = scraper.login(req.username, req.password)
        logger.info(f"Login result: {success}")
        if not success:
             logger.warning("Login returned False")

        logger.info("Fetching data...")
        data = scraper.get_all_data()
        logger.info(f"Data fetched: personal={bool(data.get('personal'))}, semesters={bool(data.get('semesters'))}, credits={bool(data.get('credits_summary'))}")
        
        # Attempt to fetch details if we can parse the credits_summary
        # This part is experimental until we see the real data structure
        try:
            credits = data.get('credits_summary', {})
            # Usually these APIs return { "list": [...] }
            # Let's try to find a list
            target_list = None
            if isinstance(credits, dict):
                for key in credits:
                    if isinstance(credits[key], list):
                        target_list = credits[key]
                        break
            elif isinstance(credits, list):
                target_list = credits

            if target_list:
                for item in target_list:
                    # Look for Year and Semester keys
                    year = item.get('cretGainYear') or item.get('year')
                    smr = item.get('cretSmrCd') or item.get('smr')
                    if year and smr:
                        logger.info(f"Fetching details for {year} - {smr}")
                        details = scraper.get_grades_detail(year, smr)
                        item['details'] = details
        except Exception as detail_e:
            logger.error(f"Failed to fetch details: {detail_e}")

        return data
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
