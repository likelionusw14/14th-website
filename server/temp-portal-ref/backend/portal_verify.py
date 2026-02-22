#!/usr/bin/env python3
import sys
import json
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scraper import SuwonPortalScraper

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"verified": False, "error": "Usage: python portal_verify.py <studentId> <password>"}))
        sys.exit(1)
    
    student_id = sys.argv[1]
    password = sys.argv[2]
    
    try:
        scraper = SuwonPortalScraper()
        success = scraper.login(student_id, password)
        
        if not success:
            print(json.dumps({"verified": False}))
            sys.exit(1)
        
        # Get personal info
        personal_info = scraper.get_personal_info()
        
        # Debug: Print personal_info structure to stderr (will be captured by Node.js)
        print(f"DEBUG: personal_info type: {type(personal_info)}", file=sys.stderr)
        if isinstance(personal_info, dict):
            print(f"DEBUG: personal_info keys: {list(personal_info.keys())}", file=sys.stderr)
            print(f"DEBUG: personal_info (first 2000 chars): {str(personal_info)[:2000]}", file=sys.stderr)
        else:
            print(f"DEBUG: personal_info is not a dict. Type: {type(personal_info)}, Value: {str(personal_info)[:500]}", file=sys.stderr)
        
        # Extract name and major from personal_info
        name = None
        major = None
        
        if isinstance(personal_info, dict):
            # Try different possible structures
            student_info = None
            
            # Structure 1: { "studentInfo": {...} }
            if "studentInfo" in personal_info:
                student_info = personal_info["studentInfo"]
                print(f"DEBUG: Found studentInfo key", file=sys.stderr)
            
            # Structure 2: { "list": [{...}] }
            elif "list" in personal_info:
                data_list = personal_info.get("list", [])
                if isinstance(data_list, list) and len(data_list) > 0:
                    student_info = data_list[0]
                    print(f"DEBUG: Found list key with {len(data_list)} items", file=sys.stderr)
            
            # Structure 3: Direct dict with student info
            elif "studNm" in personal_info or "sno" in personal_info:
                student_info = personal_info
                print(f"DEBUG: Using personal_info directly", file=sys.stderr)
            
            if isinstance(student_info, dict):
                print(f"DEBUG: student_info keys: {list(student_info.keys())[:20]}", file=sys.stderr)
                
                # Debug: Check each field individually
                studNm = student_info.get("studNm")
                korNm = student_info.get("korNm")
                dpmjNm = student_info.get("dpmjNm")
                deptNm = student_info.get("deptNm")
                
                print(f"DEBUG: studNm={repr(studNm)}, korNm={repr(korNm)}, dpmjNm={repr(dpmjNm)}, deptNm={repr(deptNm)}", file=sys.stderr)
                
                # Try multiple possible field names for name
                # Use explicit None check instead of 'or' to handle empty strings
                name = None
                for key in ["studNm", "korNm", "name", "hgNm", "nm"]:
                    value = student_info.get(key)
                    if value and isinstance(value, str) and value.strip():
                        name = value.strip()
                        print(f"DEBUG: Found name from key '{key}': {repr(name)}", file=sys.stderr)
                        break
                
                # Try multiple possible field names for major
                major = None
                for key in ["dpmjNm", "deptNm", "major", "colgNm", "dept", "deptName"]:
                    value = student_info.get(key)
                    if value and isinstance(value, str) and value.strip():
                        major = value.strip()
                        print(f"DEBUG: Found major from key '{key}': {repr(major)}", file=sys.stderr)
                        break
                
                print(f"DEBUG: Final extracted name: {repr(name)}, major: {repr(major)}", file=sys.stderr)
            else:
                print(f"DEBUG: student_info is not a dict or not found. Type: {type(student_info)}", file=sys.stderr)
        else:
            print(f"DEBUG: personal_info is not a dict. Type: {type(personal_info)}", file=sys.stderr)
        
        result = {
            "verified": True,
            "name": name,
            "major": major
        }
        
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        print(json.dumps({"verified": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

