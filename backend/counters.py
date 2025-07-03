import os

def get_next_counter(role: str) -> str:
    counter_dir = os.path.join(os.path.dirname(__file__), "counters")
    os.makedirs(counter_dir, exist_ok=True)
    filepath = os.path.join(counter_dir, f"{role}.txt")

    # Mặc định là 1 nếu chưa có file
    if not os.path.exists(filepath):
        with open(filepath, "w") as f:
            f.write("1")

    # Đọc số, tăng và lưu lại
    with open(filepath, "r+") as f:
        current = int(f.read())
        f.seek(0)
        f.write(str(current + 1))
        f.truncate()

    return current
