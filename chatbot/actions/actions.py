from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

class ActionSubmitProgram(Action):

    def name(self) -> Text:
        return "action_submit_program"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        year = tracker.get_slot("year")
        faculty = tracker.get_slot("faculty")
        major = tracker.get_slot("major")

        # B1: Tìm faculty_id từ API năm học
        faculty_resp = requests.get(f"http://localhost:8000/programs/years/{year}/faculties")
        faculty_data = faculty_resp.json()
        faculty_id = next((f["id"] for f in faculty_data if f["name"] == faculty), None)

        if not faculty_id:
            dispatcher.utter_message(text="Không tìm thấy khoa.")
            return []

        # B2: Tìm major_id
        major_resp = requests.get(f"http://localhost:8000/programs/years/{year}/faculties/{faculty_id}/majors")
        major_data = major_resp.json()
        major_id = next((m["id"] for m in major_data if m["name"] == major), None)

        if not major_id:
            dispatcher.utter_message(text="Không tìm thấy ngành.")
            return []

        # B3: Lấy chương trình đào tạo
        program_resp = requests.get(
            f"http://localhost:8000/programs/by_major?khoa={year}&major_id={major_id}"
        )

        if program_resp.status_code != 200:
            dispatcher.utter_message(text="Không tìm thấy chương trình đào tạo.")
            return []

        data = program_resp.json()
        courses = data.get("courses", [])
        course_text = "\n".join([f"{c['code']} - {c['name']} ({c['credit']} tín chỉ)" for c in courses])

        dispatcher.utter_message(text=f"Chương trình đào tạo:\n{course_text}")
        return [SlotSet("program_info", course_text)]
