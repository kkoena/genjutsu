import os
from fastapi import BackgroundTasks, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
app = FastAPI(title="Kizuna API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
                   allow_methods=["GET"], allow_headers=["*"])
REGIONS = {"North", "South", "West", "East", "North-East"}


def log_search(q: str, region: str | None):
    try:
        sb.table("search_log").insert({"q": q, "region": region}).execute()
    except Exception:
        pass  # logging must never break search


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/search")
def search(bg: BackgroundTasks, q: str = Query(..., min_length=1, max_length=80),
           region: str | None = None, limit: int = Query(10, ge=1, le=25)):
    q = q.strip()
    region = region if region in REGIONS else None
    rows = sb.rpc("search_titles", {"q": q, "reg": region, "lim": limit}).execute().data
    bg.add_task(log_search, q.lower(), region)
    return {"q": q, "region": region, "results": rows}


@app.get("/api/suggest")
def suggest(q: str = Query(..., min_length=1, max_length=40)):
    rows = sb.table("titles").select("name").ilike("name", f"{q.strip()}%").limit(6).execute().data
    return {"suggestions": [r["name"] for r in rows]}


@app.get("/api/trending")
def trending():
    return {"trending": sb.rpc("trending", {"lim": 8}).execute().data}
