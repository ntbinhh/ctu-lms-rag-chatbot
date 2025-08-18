"""
RASA NLU Performance Testing
Tests for Intent Classification, Entity Extraction, and Action Prediction
"""

import asyncio
import json
import pytest
from typing import Dict, List, Tuple
from rasa.core.agent import Agent
from rasa.shared.core.domain import Domain
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.nlu.training_data.message import Message
from rasa.model_testing import test_nlu
from sklearn.metrics import classification_report, confusion_matrix, f1_score
import numpy as np
import pandas as pd
from pathlib import Path

class RasaNLUTester:
    """Comprehensive NLU Testing Suite"""
    
    def __init__(self, model_path: str, domain_path: str = "domain.yml"):
        self.model_path = model_path
        self.domain_path = domain_path
        self.agent = None
        self.test_data = []
        
    async def load_agent(self):
        """Load RASA agent"""
        self.agent = Agent.load(self.model_path)
        
    def load_test_data(self, testcase_path: str = None):
        """Load test data for NLU evaluation from nlu_testcases.json"""
        if testcase_path is None:
            testcase_path = str(Path(__file__).parent / "nlu_testcases.json")
        try:
            with open(testcase_path, "r", encoding="utf-8") as f:
                self.test_data = json.load(f)
            print(f"✅ Loaded {len(self.test_data)} test cases from {testcase_path}")
        except Exception as e:
            print(f"⚠️ Could not load test cases from {testcase_path}: {e}")
            self.test_data = []
        
    async def test_intent_classification(self) -> Dict:
        """Test intent classification accuracy"""
        if not self.agent:
            await self.load_agent()
            
        predicted_intents = []
        true_intents = []
        confidences = []
        
        for test_case in self.test_data:
            result = await self.agent.parse_message(test_case["text"])
            predicted_intents.append(result["intent"]["name"])
            true_intents.append(test_case["intent"])
            confidences.append(result["intent"]["confidence"])
            
        # Calculate metrics
        accuracy = sum(p == t for p, t in zip(predicted_intents, true_intents)) / len(true_intents)
        
        # Classification report
        report = classification_report(true_intents, predicted_intents, output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(true_intents, predicted_intents)
        
        return {
            "accuracy": accuracy,
            "classification_report": report,
            "confusion_matrix": cm.tolist(),
            "confidences": confidences,
            "predictions": list(zip(true_intents, predicted_intents, confidences))
        }
        
    async def test_entity_extraction(self) -> Dict:
        """Test entity extraction F1 scores"""
        if not self.agent:
            await self.load_agent()
            
        entity_results = {
            "true_entities": [],
            "predicted_entities": [],
            "by_entity_type": {}
        }
        
        for test_case in self.test_data:
            result = await self.agent.parse_message(test_case["text"])
            
            # Extract true entities
            true_entities = [(e["entity"], e["value"]) for e in test_case["entities"]]
            
            # Extract predicted entities  
            predicted_entities = [(e["entity"], e["value"]) for e in result["entities"]]
            
            entity_results["true_entities"].extend(true_entities)
            entity_results["predicted_entities"].extend(predicted_entities)
            
        # Calculate entity-level F1 scores
        entity_types = set([e[0] for e in entity_results["true_entities"]] + 
                          [e[0] for e in entity_results["predicted_entities"]])
        
        for entity_type in entity_types:
            true_values = [e[1] for e in entity_results["true_entities"] if e[0] == entity_type]
            pred_values = [e[1] for e in entity_results["predicted_entities"] if e[0] == entity_type]
            
            # Simple matching F1 (exact match)
            true_set = set(true_values)
            pred_set = set(pred_values)
            
            if len(true_set) == 0 and len(pred_set) == 0:
                f1 = 1.0
            elif len(true_set) == 0 or len(pred_set) == 0:
                f1 = 0.0
            else:
                precision = len(true_set & pred_set) / len(pred_set) if pred_set else 0
                recall = len(true_set & pred_set) / len(true_set) if true_set else 0
                f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
                
            entity_results["by_entity_type"][entity_type] = {
                "f1": f1,
                "precision": precision if 'precision' in locals() else 0,
                "recall": recall if 'recall' in locals() else 0,
                "true_count": len(true_values),
                "pred_count": len(pred_values)
            }
            
        return entity_results
        
    async def test_fallback_threshold(self, confidence_thresholds: List[float] = [0.3, 0.5, 0.7, 0.8, 0.9]) -> Dict:
        """Test fallback behavior at different confidence thresholds"""
        if not self.agent:
            await self.load_agent()
            
        threshold_results = {}
        
        for threshold in confidence_thresholds:
            fallback_count = 0
            total_count = len(self.test_data)
            
            for test_case in self.test_data:
                result = await self.agent.parse_message(test_case["text"])
                confidence = result["intent"]["confidence"]
                
                if confidence < threshold:
                    fallback_count += 1
                    
            fallback_rate = fallback_count / total_count
            threshold_results[threshold] = {
                "fallback_rate": fallback_rate,
                "fallback_count": fallback_count,
                "total_count": total_count
            }
            
        return threshold_results
        
    async def test_action_prediction(self) -> Dict:
        """Test action prediction accuracy based on stories"""
        if not self.agent:
            await self.load_agent()
            
        # Test stories - simplified examples
        test_stories = [
            {
                "events": [
                    {"event": "user", "text": "học phí năm 2025", "intent": "hoi_hoc_phi"},
                ],
                "expected_action": "action_rag_query"
            },
            {
                "events": [
                    {"event": "user", "text": "xin chào", "intent": "greet"},
                ],
                "expected_action": "utter_greet"
            },
            {
                "events": [
                    {"event": "user", "text": "tạm biệt", "intent": "goodbye"},
                ],
                "expected_action": "utter_goodbye"
            }
        ]
        
        correct_predictions = 0
        total_predictions = len(test_stories)
        predictions = []
        
        for story in test_stories:
            # Simulate conversation
            result = await self.agent.parse_message(story["events"][0]["text"])
            
            # Get next action (simplified - in real implementation, this would be more complex)
            # This is a basic approximation
            intent = result["intent"]["name"]
            
            # Map intents to expected actions (based on your domain.yml)
            intent_to_action = {
                "hoi_hoc_phi": "action_rag_query",
                "hoi_tuyen_sinh": "action_rag_query", 
                "hoi_chuong_trinh": "action_rag_query",
                "hoi_hoc_bong": "action_rag_query",
                "hoi_quy_che": "action_rag_query",
                "greet": "utter_greet",
                "goodbye": "utter_goodbye",
                "nlu_fallback": "action_default_fallback"
            }
            
            predicted_action = intent_to_action.get(intent, "action_default_fallback")
            expected_action = story["expected_action"]
            
            is_correct = predicted_action == expected_action
            if is_correct:
                correct_predictions += 1
                
            predictions.append({
                "text": story["events"][0]["text"],
                "predicted_action": predicted_action,
                "expected_action": expected_action,
                "correct": is_correct
            })
            
        accuracy = correct_predictions / total_predictions
        
        return {
            "accuracy": accuracy,
            "correct_predictions": correct_predictions,
            "total_predictions": total_predictions,
            "predictions": predictions
        }
        
    async def run_comprehensive_test(self) -> Dict:
        """Run all tests and generate comprehensive report"""
        self.load_test_data()
        
        print("🧪 Running RASA NLU Comprehensive Tests...")
        
        # Intent Classification Tests
        print("📋 Testing Intent Classification...")
        intent_results = await self.test_intent_classification()
        
        # Entity Extraction Tests  
        print("🏷️ Testing Entity Extraction...")
        entity_results = await self.test_entity_extraction()
        
        # Fallback Threshold Tests
        print("⚠️ Testing Fallback Thresholds...")
        fallback_results = await self.test_fallback_threshold()
        
        # Action Prediction Tests
        print("🎯 Testing Action Prediction...")
        action_results = await self.test_action_prediction()
        
        # Generate final report
        report = {
            "intent_classification": intent_results,
            "entity_extraction": entity_results,
            "fallback_analysis": fallback_results,
            "action_prediction": action_results,
            "summary": self._generate_summary(intent_results, entity_results, fallback_results, action_results)
        }
        
        return report
        
    def _generate_summary(self, intent_results, entity_results, fallback_results, action_results) -> Dict:
        """Generate test summary with pass/fail status"""
        
        # Intent accuracy threshold: ≥ 95%
        intent_pass = intent_results["accuracy"] >= 0.95
        
        # Entity F1 threshold: ≥ 92%
        entity_f1_scores = [metrics["f1"] for metrics in entity_results["by_entity_type"].values()]
        avg_entity_f1 = np.mean(entity_f1_scores) if entity_f1_scores else 0
        entity_pass = avg_entity_f1 >= 0.92
        
        # Fallback threshold: < 5% at confidence 0.8
        fallback_pass = fallback_results.get(0.8, {}).get("fallback_rate", 1.0) < 0.05
        
        # Action prediction threshold: ≥ 90%
        action_pass = action_results["accuracy"] >= 0.90
        
        return {
            "intent_classification": {
                "accuracy": intent_results["accuracy"],
                "threshold": 0.95,
                "pass": intent_pass,
                "status": "✅ PASS" if intent_pass else "❌ FAIL"
            },
            "entity_extraction": {
                "avg_f1": avg_entity_f1,
                "threshold": 0.92,
                "pass": entity_pass,
                "status": "✅ PASS" if entity_pass else "❌ FAIL"
            },
            "fallback_control": {
                "fallback_rate_at_0.8": fallback_results.get(0.8, {}).get("fallback_rate", 1.0),
                "threshold": 0.05,
                "pass": fallback_pass,
                "status": "✅ PASS" if fallback_pass else "❌ FAIL"
            },
            "action_prediction": {
                "accuracy": action_results["accuracy"],
                "threshold": 0.90,
                "pass": action_pass,
                "status": "✅ PASS" if action_pass else "❌ FAIL"
            },
            "overall_pass": all([intent_pass, entity_pass, fallback_pass, action_pass])
        }
        
    def save_results(self, results: Dict, output_path: str = "test_results.json"):
        """Save test results to JSON file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"📊 Results saved to {output_path}")


async def main():
    """Main test runner"""
    # Update this path to your trained model
    model_path = "models/"  # Will use latest model
    
    tester = RasaNLUTester(model_path)
    
    try:
        results = await tester.run_comprehensive_test()
        
        # Print summary
        print("\n" + "="*60)
        print("🎯 RASA NLU TEST SUMMARY")
        print("="*60)
        
        summary = results["summary"]
        for test_name, test_result in summary.items():
            if test_name != "overall_pass":
                print(f"{test_name.upper()}: {test_result['status']}")
                print(f"  Score: {test_result.get('accuracy', test_result.get('avg_f1', test_result.get('fallback_rate_at_0.8', 0))):.3f}")
                print(f"  Threshold: {test_result['threshold']}")
                print()
        
        overall_status = "✅ ALL TESTS PASSED" if summary["overall_pass"] else "❌ SOME TESTS FAILED"
        print(f"OVERALL: {overall_status}")
        print("="*60)
        
        # Save detailed results
        tester.save_results(results, "chatbot_test_results.json")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
