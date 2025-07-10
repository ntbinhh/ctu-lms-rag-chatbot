from fastapi import APIRouter, Query
from datetime import date, timedelta

router = APIRouter(tags=["Tuần học"])

def get_start_date_of_week(year: int, week: int) -> date:
    # Theo chuẩn ISO: tuần 1 chứa ngày 4/1
    first_day = date(year, 1, 4)
    delta = timedelta(weeks=week - 1)
    monday = first_day - timedelta(days=first_day.weekday()) + delta
    return monday

@router.get("/")
def get_weeks(nam_hoc: int = Query(...), hoc_ky: str = Query(...)):
    week_ranges = {
        "HK1": list(range(37, 52)),  # tuần 37–51
        "HK2": list(range(1, 18)),   # tuần 1–17
        "HK3": list(range(20, 35)),  # tuần 20–34
    }

    if hoc_ky not in week_ranges:
        return {"error": "Học kỳ không hợp lệ"}

    result = []
    for i, week in enumerate(week_ranges[hoc_ky]):
        hoc_ky_week = i + 1
        # Tùy học kỳ mà tuần nằm trong năm nào:
        if hoc_ky == "HK1":
            week_year = nam_hoc  # HK1 là từ tháng 9 năm đó
        else:
            week_year = nam_hoc + 1  # HK2, HK3 là của năm tiếp theo

        start = get_start_date_of_week(week_year, week)
        end = start + timedelta(days=6)
        result.append({
            "week": week,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "hoc_ky_week": hoc_ky_week
        })

    return result
