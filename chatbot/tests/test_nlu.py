"""
Test NLU Performance for Vietnamese Chatbot
Kiểm tra hiệu suất NLU cho chatbot tiếng Việt
"""

import asyncio
import json
import pytest
from typing import Dict, List, Tuple
from rasa.core.agent import Agent
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.nlu.training_data.message import Message
from pathlib import Path
import os

class NLUTester:
    """Lớp kiểm thử NLU cho chatbot"""
    
    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        self.agent = None
        self.test_cases = self._create_test_cases()
        
    async def load_agent(self):
        """Tải RASA agent"""
        try:
            self.agent = Agent.load(self.model_path)
            print("✅ Agent loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load agent: {e}")
            raise
            
    def _create_test_cases(self) -> List[Dict]:
        """Tạo test cases dựa trên các intent trong nlu.yml"""
        return [
            # Greet intent tests
            {"text": "xin chào", "expected_intent": "greet"},
            {"text": "chào bạn", "expected_intent": "greet"},
            {"text": "hello", "expected_intent": "greet"},
            {"text": "hi", "expected_intent": "greet"},
            {"text": "chào buổi sáng", "expected_intent": "greet"},
            {"text": "good morning", "expected_intent": "greet"},
            {"text": "hế lô", "expected_intent": "greet"},
            
            # Goodbye intent tests
            {"text": "tạm biệt", "expected_intent": "goodbye"},
            {"text": "bye", "expected_intent": "goodbye"},
            {"text": "goodbye", "expected_intent": "goodbye"},
            {"text": "chào tạm biệt", "expected_intent": "goodbye"},
            {"text": "see you later", "expected_intent": "goodbye"},
            {"text": "chúc ngủ ngon", "expected_intent": "goodbye"},
            {"text": "hẹn gặp lại", "expected_intent": "goodbye"},
            
            # General question intent tests
            {"text": "thông tin học bổng", "expected_intent": "general_question"},
            {"text": "học phí một học kỳ là bao nhiêu?", "expected_intent": "general_question"},
            {"text": "quy định về điểm số như thế nào?", "expected_intent": "general_question"},
            {"text": "thủ tục xin học bổng", "expected_intent": "general_question"},
            {"text": "địa chỉ trường", "expected_intent": "general_question"},
            {"text": "chương trình đào tạo", "expected_intent": "general_question"},
            {"text": "điều kiện tốt nghiệp", "expected_intent": "general_question"},
            {"text": "quy chế đào tạo", "expected_intent": "general_question"},
            
            # Affirm intent tests
            {"text": "yes", "expected_intent": "affirm"},
            {"text": "đúng", "expected_intent": "affirm"},
            {"text": "ok", "expected_intent": "affirm"},
            {"text": "được", "expected_intent": "affirm"},
            {"text": "chắc chắn", "expected_intent": "affirm"},
            
            # Deny intent tests
            {"text": "no", "expected_intent": "deny"},
            {"text": "không", "expected_intent": "deny"},
            {"text": "không muốn", "expected_intent": "deny"},
            {"text": "thôi", "expected_intent": "deny"},
            
            # Mood great intent tests
            {"text": "tuyệt vời", "expected_intent": "mood_great"},
            {"text": "perfect", "expected_intent": "mood_great"},
            {"text": "quá tuyệt", "expected_intent": "mood_great"},
            {"text": "tôi rất vui", "expected_intent": "mood_great"},
            
            # Mood unhappy intent tests
            {"text": "tôi buồn", "expected_intent": "mood_unhappy"},
            {"text": "không vui", "expected_intent": "mood_unhappy"},
            {"text": "my day was horrible", "expected_intent": "mood_unhappy"},
            {"text": "stress", "expected_intent": "mood_unhappy"},
            
            # Bot challenge intent tests
            {"text": "bạn là ai?", "expected_intent": "bot_challenge"},
            {"text": "are you a bot?", "expected_intent": "bot_challenge"},
            {"text": "bạn có phải là bot không?", "expected_intent": "bot_challenge"},
            
            # Schedule related intents
            {"text": "lịch học hôm nay", "expected_intent": "ask_today_schedule"},
            {"text": "hôm nay tôi có môn gì", "expected_intent": "ask_today_schedule"},
            
            {"text": "lịch học tuần này", "expected_intent": "ask_schedule_week"},
            {"text": "thời khóa biểu tuần này", "expected_intent": "ask_schedule_week"},
            
            {"text": "lịch học ngày mai", "expected_intent": "ask_schedule_tomorrow"},
            {"text": "mai có lớp không", "expected_intent": "ask_schedule_tomorrow"},
            
            {"text": "tiết học tiếp theo", "expected_intent": "ask_next_class"},
            {"text": "môn tiếp theo là gì", "expected_intent": "ask_next_class"},
            
            {"text": "ctdt", "expected_intent": "ask_student_program"},
            {"text": "chương trình học của tôi", "expected_intent": "ask_student_program"},
            {"text": "xem chương trình học của mình", "expected_intent": "ask_student_program"},
        ]
        
    async def test_intent_classification(self) -> Dict:
        """Kiểm tra phân loại intent"""
        if not self.agent:
            await self.load_agent()
            
        results = {
            "total_tests": len(self.test_cases),
            "correct": 0,
            "incorrect": 0,
            "details": [],
            "accuracy": 0.0
        }
        
        for test_case in self.test_cases:
            try:
                result = await self.agent.parse_message(test_case["text"])
                predicted_intent = result["intent"]["name"]
                confidence = result["intent"]["confidence"]
                expected_intent = test_case["expected_intent"]
                
                is_correct = predicted_intent == expected_intent
                
                if is_correct:
                    results["correct"] += 1
                else:
                    results["incorrect"] += 1
                    
                results["details"].append({
                    "text": test_case["text"],
                    "expected": expected_intent,
                    "predicted": predicted_intent,
                    "confidence": confidence,
                    "correct": is_correct
                })
                
            except Exception as e:
                print(f"❌ Error testing '{test_case['text']}': {e}")
                results["details"].append({
                    "text": test_case["text"],
                    "expected": test_case["expected_intent"],
                    "predicted": "ERROR",
                    "confidence": 0.0,
                    "correct": False,
                    "error": str(e)
                })
                results["incorrect"] += 1
                
        results["accuracy"] = results["correct"] / results["total_tests"] if results["total_tests"] > 0 else 0
        return results
        
    async def test_confidence_threshold(self, min_confidence: float = 0.5) -> Dict:
        """Kiểm tra ngưỡng confidence"""
        if not self.agent:
            await self.load_agent()
            
        low_confidence_cases = []
        
        for test_case in self.test_cases:
            try:
                result = await self.agent.parse_message(test_case["text"])
                confidence = result["intent"]["confidence"]
                
                if confidence < min_confidence:
                    low_confidence_cases.append({
                        "text": test_case["text"],
                        "expected_intent": test_case["expected_intent"],
                        "predicted_intent": result["intent"]["name"],
                        "confidence": confidence
                    })
                    
            except Exception as e:
                print(f"❌ Error testing confidence for '{test_case['text']}': {e}")
                
        return {
            "min_confidence": min_confidence,
            "total_tests": len(self.test_cases),
            "low_confidence_count": len(low_confidence_cases),
            "low_confidence_rate": len(low_confidence_cases) / len(self.test_cases),
            "low_confidence_cases": low_confidence_cases
        }
        
    def analyze_intent_distribution(self, results: Dict) -> Dict:
        """Phân tích phân bố intent"""
        intent_stats = {}
        
        for detail in results["details"]:
            expected = detail["expected"]
            predicted = detail["predicted"]
            correct = detail["correct"]
            
            if expected not in intent_stats:
                intent_stats[expected] = {
                    "total": 0,
                    "correct": 0,
                    "accuracy": 0.0,
                    "predictions": []
                }
                
            intent_stats[expected]["total"] += 1
            if correct:
                intent_stats[expected]["correct"] += 1
            intent_stats[expected]["predictions"].append(predicted)
            
        # Tính accuracy cho từng intent
        for intent in intent_stats:
            stats = intent_stats[intent]
            stats["accuracy"] = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            
        return intent_stats
        
    async def run_full_test(self) -> Dict:
        """Chạy toàn bộ test"""
        print("🧪 Bắt đầu kiểm thử NLU...")
        
        # Test intent classification
        print("📋 Kiểm thử phân loại intent...")
        intent_results = await self.test_intent_classification()
        
        # Test confidence threshold
        print("🎯 Kiểm thử ngưỡng confidence...")
        confidence_results = await self.test_confidence_threshold(0.5)
        
        # Analyze intent distribution
        print("📊 Phân tích phân bố intent...")
        intent_distribution = self.analyze_intent_distribution(intent_results)
        
        return {
            "intent_classification": intent_results,
            "confidence_analysis": confidence_results,
            "intent_distribution": intent_distribution,
            "summary": self._generate_summary(intent_results, confidence_results, intent_distribution)
        }
        
    def _generate_summary(self, intent_results: Dict, confidence_results: Dict, intent_distribution: Dict) -> Dict:
        """Tạo báo cáo tổng kết"""
        # Tìm intent có accuracy thấp nhất
        worst_intent = min(intent_distribution.items(), 
                          key=lambda x: x[1]["accuracy"]) if intent_distribution else ("none", {"accuracy": 0})
        
        # Tìm intent có accuracy cao nhất
        best_intent = max(intent_distribution.items(), 
                         key=lambda x: x[1]["accuracy"]) if intent_distribution else ("none", {"accuracy": 0})
        
        return {
            "overall_accuracy": intent_results["accuracy"],
            "total_tests": intent_results["total_tests"],
            "correct_predictions": intent_results["correct"],
            "incorrect_predictions": intent_results["incorrect"],
            "low_confidence_rate": confidence_results["low_confidence_rate"],
            "best_performing_intent": {
                "intent": best_intent[0],
                "accuracy": best_intent[1]["accuracy"]
            },
            "worst_performing_intent": {
                "intent": worst_intent[0],
                "accuracy": worst_intent[1]["accuracy"]
            },
            "pass_criteria": {
                "accuracy_threshold": 0.85,
                "confidence_threshold": 0.5,
                "max_low_confidence_rate": 0.1
            },
            "test_status": {
                "accuracy_pass": intent_results["accuracy"] >= 0.85,
                "confidence_pass": confidence_results["low_confidence_rate"] <= 0.1,
                "overall_pass": (intent_results["accuracy"] >= 0.85 and 
                               confidence_results["low_confidence_rate"] <= 0.1)
            }
        }
        
    def save_results(self, results: Dict, output_path: str = "nlu_test_results.json"):
        """Lưu kết quả test"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"📄 Kết quả đã được lưu vào {output_path}")
        except Exception as e:
            print(f"❌ Lỗi khi lưu kết quả: {e}")
            
    def print_summary(self, summary: Dict):
        """In báo cáo tổng kết"""
        print("\n" + "="*60)
        print("📊 BÁO CÁO KIỂM THỬ NLU")
        print("="*60)
        
        print(f"Tổng số test cases: {summary['total_tests']}")
        print(f"Dự đoán đúng: {summary['correct_predictions']}")
        print(f"Dự đoán sai: {summary['incorrect_predictions']}")
        print(f"Độ chính xác tổng thể: {summary['overall_accuracy']:.2%}")
        print(f"Tỷ lệ confidence thấp: {summary['low_confidence_rate']:.2%}")
        
        print(f"\nIntent tốt nhất: {summary['best_performing_intent']['intent']} "
              f"({summary['best_performing_intent']['accuracy']:.2%})")
        print(f"Intent cần cải thiện: {summary['worst_performing_intent']['intent']} "
              f"({summary['worst_performing_intent']['accuracy']:.2%})")
        
        print(f"\nTrạng thái kiểm thử:")
        accuracy_status = "✅ PASS" if summary['test_status']['accuracy_pass'] else "❌ FAIL"
        confidence_status = "✅ PASS" if summary['test_status']['confidence_pass'] else "❌ FAIL"
        overall_status = "✅ PASS" if summary['test_status']['overall_pass'] else "❌ FAIL"
        
        print(f"  Độ chính xác (≥85%): {accuracy_status}")
        print(f"  Confidence (≤10% thấp): {confidence_status}")
        print(f"  Tổng thể: {overall_status}")
        
        print("="*60)


async def main():
    """Hàm chính để chạy test"""
    # Đường dẫn tới model đã train
    model_path = "models/"
    
    # Kiểm tra xem có model không
    if not os.path.exists(model_path):
        print("❌ Không tìm thấy thư mục models/")
        print("Vui lòng train model trước khi chạy test:")
        print("rasa train")
        return
        
    tester = NLUTester(model_path)
    
    try:
        # Chạy toàn bộ test
        results = await tester.run_full_test()
        
        # In báo cáo
        tester.print_summary(results["summary"])
        
        # Lưu kết quả chi tiết
        tester.save_results(results, "nlu_test_results.json")
        
        # In một số trường hợp sai để debug
        print(f"\n🔍 MỘT SỐ TRƯỜNG HỢP DỰ ĐOÁN SAI:")
        incorrect_cases = [detail for detail in results["intent_classification"]["details"] 
                          if not detail["correct"]][:5]  # Chỉ in 5 trường hợp đầu
        
        for case in incorrect_cases:
            print(f"  Text: '{case['text']}'")
            print(f"  Expected: {case['expected']} | Predicted: {case['predicted']} "
                  f"(confidence: {case['confidence']:.3f})")
            print()
            
    except Exception as e:
        print(f"❌ Lỗi khi chạy test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
