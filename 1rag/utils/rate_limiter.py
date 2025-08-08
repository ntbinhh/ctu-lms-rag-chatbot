"""
Rate limiter để tránh vượt quota Gemini API
"""

import time
import threading
from typing import Dict, Any
from functools import wraps

class GeminiRateLimiter:
    """Rate limiter cho Gemini API free tier"""
    
    def __init__(self):
        self.last_request_time = 0
        self.request_count = 0
        self.daily_request_count = 0
        self.last_reset_time = time.time()
        self.lock = threading.Lock()
        
        # Free tier limits
        self.requests_per_minute = 15  # Conservative limit
        self.requests_per_day = 1500   # Free tier daily limit
        self.min_delay_between_requests = 4  # seconds
    
    def can_make_request(self) -> bool:
        """Kiểm tra xem có thể gọi API không"""
        with self.lock:
            current_time = time.time()
            
            # Reset daily counter if needed
            if current_time - self.last_reset_time > 86400:  # 24 hours
                self.daily_request_count = 0
                self.last_reset_time = current_time
            
            # Check daily limit
            if self.daily_request_count >= self.requests_per_day:
                return False
            
            # Check time since last request
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.min_delay_between_requests:
                return False
            
            return True
    
    def wait_if_needed(self):
        """Chờ nếu cần thiết để tránh vượt quota"""
        with self.lock:
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            
            if time_since_last < self.min_delay_between_requests:
                sleep_time = self.min_delay_between_requests - time_since_last
                print(f"⏳ Đang chờ {sleep_time:.1f}s để tránh vượt quota...")
                time.sleep(sleep_time)
    
    def record_request(self):
        """Ghi nhận một request đã được thực hiện"""
        with self.lock:
            self.last_request_time = time.time()
            self.request_count += 1
            self.daily_request_count += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Lấy thống kê sử dụng API"""
        return {
            "daily_requests": self.daily_request_count,
            "daily_limit": self.requests_per_day,
            "remaining_today": self.requests_per_day - self.daily_request_count,
            "last_request": self.last_request_time
        }

# Global rate limiter instance
rate_limiter = GeminiRateLimiter()

def rate_limited(func):
    """Decorator để thêm rate limiting cho functions"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Chờ nếu cần thiết
        rate_limiter.wait_if_needed()
        
        # Kiểm tra có thể gọi API không
        if not rate_limiter.can_make_request():
            stats = rate_limiter.get_stats()
            raise Exception(f"🚫 Đã vượt quota API. Còn lại hôm nay: {stats['remaining_today']} requests")
        
        try:
            # Gọi function
            result = func(*args, **kwargs)
            rate_limiter.record_request()
            return result
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                print("⚠️ Đã vượt quota, sẽ chờ lâu hơn...")
                rate_limiter.min_delay_between_requests = 10  # Tăng delay
            raise
    
    return wrapper
