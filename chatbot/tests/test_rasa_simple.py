"""
Simple RASA Test Runner
Runs basic NLU tests without heavy dependencies
"""

import asyncio
import json
import sys
import os
from pathlib import Path

# Add parent directory to path to import RASA
sys.path.append(str(Path(__file__).parent.parent))

class SimpleRasaTester:
    """Lightweight RASA NLU Tester"""
    
    def __init__(self):
        self.test_data = []
        self.results = {}
        
    def load_test_data(self):
        """Load test cases for evaluation"""
        self.test_data = [
            # Học phí intent tests
            {"text": "học phí năm 2025 là bao nhiêu", "expected_intent": "hoi_hoc_phi"},
            {"text": "tôi muốn biết mức học phí", "expected_intent": "hoi_hoc_phi"},
            {"text": "học phí đào tạo từ xa", "expected_intent": "hoi_hoc_phi"},
            {"text": "chi phí học tập", "expected_intent": "hoi_hoc_phi"},
            
            # Tuyển sinh intent tests  
            {"text": "điều kiện tuyển sinh là gì", "expected_intent": "hoi_tuyen_sinh"},
            {"text": "thủ tục xét tuyển năm 2025", "expected_intent": "hoi_tuyen_sinh"},
            {"text": "phương thức tuyển sinh", "expected_intent": "hoi_tuyen_sinh"},
            {"text": "hồ sơ xét tuyển gồm những gì", "expected_intent": "hoi_tuyen_sinh"},
            
            # Chương trình đào tạo intent tests
            {"text": "chương trình đào tạo công nghệ thông tin", "expected_intent": "hoi_chuong_trinh"},
            {"text": "cấu trúc năm học", "expected_intent": "hoi_chuong_trinh"},
            {"text": "số tín chỉ tối thiểu", "expected_intent": "hoi_chuong_trinh"},
            {"text": "điều kiện tốt nghiệp", "expected_intent": "hoi_chuong_trinh"},
            
            # Học bổng intent tests
            {"text": "có những loại học bổng nào", "expected_intent": "hoi_hoc_bong"},
            {"text": "điều kiện nhận học bổng", "expected_intent": "hoi_hoc_bong"},
            {"text": "trợ cấp sinh viên", "expected_intent": "hoi_hoc_bong"},
            
            # Quy chế intent tests
            {"text": "quy định về nghỉ học", "expected_intent": "hoi_quy_che"},
            {"text": "nội quy sinh viên", "expected_intent": "hoi_quy_che"},
            {"text": "quy chế đào tạo", "expected_intent": "hoi_quy_che"},
            
            # Greeting tests
            {"text": "xin chào", "expected_intent": "greet"},
            {"text": "chào bạn", "expected_intent": "greet"},
            {"text": "hello", "expected_intent": "greet"},
            
            # Goodbye tests
            {"text": "tạm biệt", "expected_intent": "goodbye"},
            {"text": "bye bye", "expected_intent": "goodbye"},
            {"text": "hẹn gặp lại", "expected_intent": "goodbye"},
            
            # Out of scope tests
            {"text": "thời tiết hôm nay", "expected_intent": "nlu_fallback"},
            {"text": "mua bán hàng hóa", "expected_intent": "nlu_fallback"},
            {"text": "asdfghjkl", "expected_intent": "nlu_fallback"},
        ]
        
    async def test_with_rasa_agent(self):
        """Test using RASA agent if available"""
        try:
            from rasa.core.agent import Agent
            
            # Try to load the latest model
            model_dir = Path("models")
            if not model_dir.exists():
                print("❌ No models directory found")
                return None
                
            model_files = list(model_dir.glob("*.tar.gz"))
            if not model_files:
                print("❌ No trained models found")
                return None
                
            # Get latest model
            latest_model = max(model_files, key=os.path.getctime)
            print(f"📦 Loading model: {latest_model}")
            
            agent = Agent.load(str(latest_model))
            
            correct_predictions = 0
            total_predictions = len(self.test_data)
            detailed_results = []
            
            for test_case in self.test_data:
                try:
                    result = await agent.parse_message(test_case["text"])
                    predicted_intent = result["intent"]["name"]
                    confidence = result["intent"]["confidence"]
                    expected_intent = test_case["expected_intent"]
                    
                    is_correct = predicted_intent == expected_intent
                    if is_correct:
                        correct_predictions += 1
                        
                    detailed_results.append({
                        "text": test_case["text"],
                        "expected": expected_intent,
                        "predicted": predicted_intent,
                        "confidence": confidence,
                        "correct": is_correct
                    })
                    
                except Exception as e:
                    print(f"⚠️ Error processing '{test_case['text']}': {e}")
                    
            accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
            
            return {
                "accuracy": accuracy,
                "correct": correct_predictions,
                "total": total_predictions,
                "details": detailed_results
            }
            
        except ImportError:
            print("⚠️ RASA not installed, skipping RASA-based tests")
            return None
        except Exception as e:
            print(f"❌ Error loading RASA: {e}")
            return None
            
    def test_manual_classification(self):
        """Manual keyword-based classification for comparison"""
        
        # Simple keyword mapping
        keyword_rules = {
            "hoi_hoc_phi": ["học phí", "chi phí", "mức phí", "tiền học"],
            "hoi_tuyen_sinh": ["tuyển sinh", "xét tuyển", "thủ tục", "hồ sơ", "điều kiện tuyển"],
            "hoi_chuong_trinh": ["chương trình", "cấu trúc", "tín chỉ", "tốt nghiệp", "năm học"],
            "hoi_hoc_bong": ["học bổng", "trợ cấp", "hỗ trợ"],
            "hoi_quy_che": ["quy định", "quy chế", "nội quy"],
            "greet": ["xin chào", "chào", "hello", "hi"],
            "goodbye": ["tạm biệt", "bye", "chào", "hẹn gặp"],
        }
        
        correct_predictions = 0
        total_predictions = len(self.test_data)
        detailed_results = []
        
        for test_case in self.test_data:
            text = test_case["text"].lower()
            predicted_intent = "nlu_fallback"  # default
            
            # Check each intent's keywords
            for intent, keywords in keyword_rules.items():
                if any(keyword in text for keyword in keywords):
                    predicted_intent = intent
                    break
                    
            expected_intent = test_case["expected_intent"]
            is_correct = predicted_intent == expected_intent
            
            if is_correct:
                correct_predictions += 1
                
            detailed_results.append({
                "text": test_case["text"],
                "expected": expected_intent,
                "predicted": predicted_intent,
                "correct": is_correct
            })
            
        accuracy = correct_predictions / total_predictions
        
        return {
            "accuracy": accuracy,
            "correct": correct_predictions,
            "total": total_predictions,
            "details": detailed_results
        }
        
    def analyze_confusion_patterns(self, results):
        """Analyze confusion patterns"""
        if not results or "details" not in results:
            return {}
            
        confusion_pairs = {}
        
        for detail in results["details"]:
            if not detail["correct"]:
                pair = (detail["expected"], detail["predicted"])
                if pair not in confusion_pairs:
                    confusion_pairs[pair] = []
                confusion_pairs[pair].append(detail["text"])
                
        return confusion_pairs
        
    def generate_report(self, rasa_results, manual_results):
        """Generate comprehensive test report"""
        
        report = {
            "timestamp": asyncio.get_event_loop().time(),
            "test_summary": {
                "total_test_cases": len(self.test_data),
                "test_categories": {
                    "hoi_hoc_phi": len([t for t in self.test_data if t["expected_intent"] == "hoi_hoc_phi"]),
                    "hoi_tuyen_sinh": len([t for t in self.test_data if t["expected_intent"] == "hoi_tuyen_sinh"]),
                    "hoi_chuong_trinh": len([t for t in self.test_data if t["expected_intent"] == "hoi_chuong_trinh"]),
                    "hoi_hoc_bong": len([t for t in self.test_data if t["expected_intent"] == "hoi_hoc_bong"]),
                    "hoi_quy_che": len([t for t in self.test_data if t["expected_intent"] == "hoi_quy_che"]),
                    "greet": len([t for t in self.test_data if t["expected_intent"] == "greet"]),
                    "goodbye": len([t for t in self.test_data if t["expected_intent"] == "goodbye"]),
                    "nlu_fallback": len([t for t in self.test_data if t["expected_intent"] == "nlu_fallback"]),
                }
            }
        }
        
        if rasa_results:
            report["rasa_nlu_results"] = rasa_results
            report["rasa_confusion_analysis"] = self.analyze_confusion_patterns(rasa_results)
            
            # Performance assessment
            accuracy = rasa_results["accuracy"]
            if accuracy >= 0.95:
                status = "✅ EXCELLENT"
            elif accuracy >= 0.90:
                status = "✅ GOOD"
            elif accuracy >= 0.80:
                status = "⚠️ ACCEPTABLE"
            else:
                status = "❌ NEEDS IMPROVEMENT"
                
            report["rasa_performance_assessment"] = {
                "accuracy": accuracy,
                "status": status,
                "meets_target": accuracy >= 0.95,
                "target_accuracy": 0.95
            }
        
        if manual_results:
            report["manual_classification_results"] = manual_results
            report["manual_confusion_analysis"] = self.analyze_confusion_patterns(manual_results)
            
        return report
        
    async def run_all_tests(self):
        """Run all available tests"""
        print("🧪 Starting RASA NLU Performance Tests")
        print("="*50)
        
        self.load_test_data()
        print(f"📋 Loaded {len(self.test_data)} test cases")
        
        # Test with RASA if available
        print("\n🤖 Testing with RASA NLU...")
        rasa_results = await self.test_with_rasa_agent()
        
        # Test with manual classification
        print("\n📝 Testing with manual keyword classification...")
        manual_results = self.test_manual_classification()
        
        # Generate report
        report = self.generate_report(rasa_results, manual_results)
        
        # Print summary
        print("\n" + "="*50)
        print("📊 TEST RESULTS SUMMARY")
        print("="*50)
        
        if rasa_results:
            print(f"🤖 RASA NLU Accuracy: {rasa_results['accuracy']:.3f} ({rasa_results['correct']}/{rasa_results['total']})")
            print(f"   Performance: {report['rasa_performance_assessment']['status']}")
            
        if manual_results:
            print(f"📝 Manual Classification Accuracy: {manual_results['accuracy']:.3f} ({manual_results['correct']}/{manual_results['total']})")
            
        # Show confusion patterns
        if rasa_results and report["rasa_confusion_analysis"]:
            print("\n🔍 Main Confusion Patterns (RASA):")
            for (expected, predicted), examples in list(report["rasa_confusion_analysis"].items())[:3]:
                print(f"   '{expected}' → '{predicted}': {len(examples)} cases")
                print(f"     Example: '{examples[0]}'")
                
        print("\n💾 Saving detailed results...")
        with open("nlu_test_results.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print("✅ Results saved to nlu_test_results.json")
        
        return report


async def main():
    """Main test runner"""
    tester = SimpleRasaTester()
    
    try:
        await tester.run_all_tests()
        print("\n✅ All tests completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Tests failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
