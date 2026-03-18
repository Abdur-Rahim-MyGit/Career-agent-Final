import requests
from bs4 import BeautifulSoup
import json
import logging
import time
import random
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DRAFTS_FILE = os.path.join(os.path.dirname(__file__), 'data_drafts.json')

def fetch_job_listings(query="Data Analyst", location="India", limit=5):
    logger.info(f"Fetching job listings for {query} in {location}...")
    time.sleep(1) # Simulate network delay
    mock_results = []
    base_salary = 600000 if 'Data' in query else 450000
    for i in range(limit):
        mock_results.append({
            "id": f"job_{int(time.time())}_{random.randint(100,999)}",
            "title": query,
            "company": f"TechCorp {['India', 'Global', 'Solutions'][i%3]}",
            "location": ['Bangalore', 'Hyderabad', 'Pune', 'Remote'][i%4],
            "required_skills": [query.split()[0], "SQL", "Python", "Communication"],
            "salary_est": base_salary + (i * 50000),
            "source": "Mock_Aggregator",
            "status": "DRAFT_PENDING_HUMAN_APPROVAL",
            "timestamp": time.time()
        })
    return mock_results

def run_pipeline():
    logger.info("=== Pipeline Run Started ===")
    drafts = []
    if os.path.exists(DRAFTS_FILE):
        with open(DRAFTS_FILE, 'r') as f:
            try:
                drafts = json.load(f)
            except:
                pass
                
    roles_to_scrape = ["Data Analyst", "Business Analyst", "Full Stack Developer"]
    for role in roles_to_scrape:
        jobs = fetch_job_listings(query=role, limit=3) # small limit for demo
        drafts.extend(jobs)
        
    with open(DRAFTS_FILE, "w") as f:
        json.dump(drafts, f, indent=2)
        
    logger.info(f"Successfully wrote {len(drafts)} drafts to {DRAFTS_FILE} for Admin review.")
    logger.info("=== Pipeline Run Finished ===")

if __name__ == "__main__":
    run_pipeline()
