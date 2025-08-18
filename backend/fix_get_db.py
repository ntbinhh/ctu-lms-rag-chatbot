#!/usr/bin/env python3
"""
Script to fix duplicate get_db() functions in all backend files
"""

import os
import re

# Danh sách các files cần fix
files_to_fix = [
    "training_program.py",
    "training_major.py", 
    "slider_routes.py",
    "program_view.py",
    "news_routes.py",
    "manager.py",
    "faculty.py",
    "facilities.py",
    "courses_routes.py"
]

backend_dir = "."

def fix_file(filename):
    filepath = os.path.join(backend_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to find duplicate get_db function
    pattern = r'from database import SessionLocal.*?\n\ndef get_db\(\):\s*\n\s*db = SessionLocal\(\)\s*\n\s*try:\s*\n\s*yield db\s*\n\s*finally:\s*\n\s*db\.close\(\)'
    
    # Replace with import statement
    new_content = re.sub(pattern, 'from database import get_db', content, flags=re.DOTALL)
    
    # Also fix import if it exists
    new_content = new_content.replace('from database import SessionLocal', 'from database import get_db')
    
    # Remove standalone get_db function if exists
    get_db_pattern = r'\ndef get_db\(\):\s*\n\s*db = SessionLocal\(\)\s*\n\s*try:\s*\n\s*yield db\s*\n\s*finally:\s*\n\s*db\.close\(\)'
    new_content = re.sub(get_db_pattern, '', new_content, flags=re.DOTALL)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {filename}")
    else:
        print(f"No changes needed: {filename}")

if __name__ == "__main__":
    for filename in files_to_fix:
        fix_file(filename)
    print("All files processed!")
