"""
Main Test Suite for RASA NLU Performance
Runs all NLU tests and generates comprehensive report
"""

import asyncio
import json
import time
from pathlib import Path
from test_rasa_simple import SimpleRasaTester
from test_entity_extraction import EntityExtractionTester

class ComprehensiveNLUTestSuite:
    """Complete NLU test suite runner"""
    
    def __init__(self):
        self.results = {}
        self.start_time = None
        
    async def run_all_tests(self):
        """Run all NLU performance tests"""
        print("🧪 COMPREHENSIVE RASA NLU TEST SUITE")
        print("="*60)
        print("This test suite evaluates:")
        print("✓ Intent Classification Accuracy")
        print("✓ Entity Extraction F1 Scores") 
        print("✓ Fallback Threshold Analysis")
        print("✓ Action Prediction Accuracy")
        print("="*60)
        
        self.start_time = time.time()
        
        # 1. Run Intent Classification Tests
        print("\n🎯 PHASE 1: Intent Classification Testing")
        print("-" * 40)
        intent_tester = SimpleRasaTester()
        intent_results = await intent_tester.run_all_tests()
        self.results["intent_classification"] = intent_results
        
        # 2. Run Entity Extraction Tests  
        print("\n🏷️ PHASE 2: Entity Extraction Testing")
        print("-" * 40)
        entity_tester = EntityExtractionTester()
        entity_results = await entity_tester.run_entity_tests()
        self.results["entity_extraction"] = entity_results
        
        # 3. Generate Final Report
        print("\n📊 PHASE 3: Generating Final Report")
        print("-" * 40)
        final_report = self.generate_final_report()
        
        # 4. Save and Display Results
        self.save_final_results(final_report)
        self.display_final_summary(final_report)
        
        return final_report
        
    def generate_final_report(self):
        """Generate comprehensive final report"""
        end_time = time.time()
        test_duration = end_time - self.start_time
        
        report = {
            "test_metadata": {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "duration_seconds": test_duration,
                "test_framework": "Custom RASA NLU Test Suite",
                "version": "1.0"
            },
            "test_results": self.results,
            "performance_summary": {},
            "recommendations": []
        }
        
        # Extract key metrics
        intent_metrics = {}
        entity_metrics = {}
        
        # Intent classification metrics
        if "intent_classification" in self.results:
            if "rasa_nlu_results" in self.results["intent_classification"]:
                rasa_results = self.results["intent_classification"]["rasa_nlu_results"]
                intent_metrics = {
                    "accuracy": rasa_results.get("accuracy", 0),
                    "total_tests": rasa_results.get("total", 0),
                    "correct_predictions": rasa_results.get("correct", 0)
                }
                
        # Entity extraction metrics
        if "entity_extraction" in self.results:
            if "rasa_entity_results" in self.results["entity_extraction"]:
                entity_results = self.results["entity_extraction"]["rasa_entity_results"]
                if entity_results and "overall_metrics" in entity_results:
                    entity_metrics = entity_results["overall_metrics"]
                    
        # Performance assessment
        performance_summary = {
            "intent_classification": {
                "accuracy": intent_metrics.get("accuracy", 0),
                "target": 0.95,
                "status": "PASS" if intent_metrics.get("accuracy", 0) >= 0.95 else "FAIL",
                "score": "A" if intent_metrics.get("accuracy", 0) >= 0.95 else 
                        "B" if intent_metrics.get("accuracy", 0) >= 0.90 else
                        "C" if intent_metrics.get("accuracy", 0) >= 0.80 else "D"
            },
            "entity_extraction": {
                "f1_score": entity_metrics.get("f1", 0),
                "precision": entity_metrics.get("precision", 0),
                "recall": entity_metrics.get("recall", 0),
                "target": 0.92,
                "status": "PASS" if entity_metrics.get("f1", 0) >= 0.92 else "FAIL",
                "score": "A" if entity_metrics.get("f1", 0) >= 0.92 else
                        "B" if entity_metrics.get("f1", 0) >= 0.85 else
                        "C" if entity_metrics.get("f1", 0) >= 0.75 else "D"
            }
        }
        
        report["performance_summary"] = performance_summary
        
        # Generate recommendations
        recommendations = []
        
        if intent_metrics.get("accuracy", 0) < 0.95:
            recommendations.append({
                "category": "Intent Classification",
                "issue": f"Accuracy {intent_metrics.get('accuracy', 0):.3f} below target 0.95",
                "suggestion": "Add more training examples for confused intents. Check confusion matrix for patterns."
            })
            
        if entity_metrics.get("f1", 0) < 0.92:
            recommendations.append({
                "category": "Entity Extraction", 
                "issue": f"F1 score {entity_metrics.get('f1', 0):.3f} below target 0.92",
                "suggestion": "Improve entity training data. Add more diverse examples for each entity type."
            })
            
        if entity_metrics.get("precision", 0) < 0.90:
            recommendations.append({
                "category": "Entity Precision",
                "issue": f"Precision {entity_metrics.get('precision', 0):.3f} indicates false positives",
                "suggestion": "Review entity patterns to reduce false positive extractions."
            })
            
        if entity_metrics.get("recall", 0) < 0.90:
            recommendations.append({
                "category": "Entity Recall",
                "issue": f"Recall {entity_metrics.get('recall', 0):.3f} indicates missed entities",
                "suggestion": "Add more training examples with diverse entity expressions."
            })
            
        report["recommendations"] = recommendations
        
        return report
        
    def save_final_results(self, report):
        """Save comprehensive results"""
        output_file = "comprehensive_nlu_test_report.json"
        
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        print(f"💾 Comprehensive report saved to {output_file}")
        
        # Also save a summary CSV for easy analysis
        self.save_summary_csv(report)
        
    def save_summary_csv(self, report):
        """Save summary in CSV format"""
        try:
            import csv
            
            summary_file = "nlu_test_summary.csv"
            
            with open(summary_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                
                # Headers
                writer.writerow([
                    "Metric", "Value", "Target", "Status", "Score"
                ])
                
                # Intent classification
                intent_summary = report["performance_summary"]["intent_classification"]
                writer.writerow([
                    "Intent Classification Accuracy",
                    f"{intent_summary['accuracy']:.3f}",
                    f"{intent_summary['target']:.3f}",
                    intent_summary['status'],
                    intent_summary['score']
                ])
                
                # Entity extraction
                entity_summary = report["performance_summary"]["entity_extraction"]
                writer.writerow([
                    "Entity Extraction F1",
                    f"{entity_summary['f1_score']:.3f}",
                    f"{entity_summary['target']:.3f}",
                    entity_summary['status'],
                    entity_summary['score']
                ])
                
                writer.writerow([
                    "Entity Extraction Precision",
                    f"{entity_summary['precision']:.3f}",
                    "0.90",
                    "PASS" if entity_summary['precision'] >= 0.90 else "FAIL",
                    ""
                ])
                
                writer.writerow([
                    "Entity Extraction Recall", 
                    f"{entity_summary['recall']:.3f}",
                    "0.90",
                    "PASS" if entity_summary['recall'] >= 0.90 else "FAIL",
                    ""
                ])
                
            print(f"📊 Summary CSV saved to {summary_file}")
            
        except ImportError:
            print("⚠️ CSV module not available, skipping CSV export")
            
    def display_final_summary(self, report):
        """Display final test summary"""
        print("\n" + "="*60)
        print("🎯 FINAL NLU PERFORMANCE REPORT")
        print("="*60)
        
        # Test metadata
        metadata = report["test_metadata"]
        print(f"📅 Test Date: {metadata['timestamp']}")
        print(f"⏱️ Duration: {metadata['duration_seconds']:.1f} seconds")
        
        # Performance summary
        print(f"\n📊 PERFORMANCE SUMMARY:")
        print("-" * 30)
        
        performance = report["performance_summary"]
        
        # Intent classification
        intent_perf = performance["intent_classification"]
        intent_status_icon = "✅" if intent_perf["status"] == "PASS" else "❌"
        print(f"{intent_status_icon} Intent Classification: {intent_perf['accuracy']:.3f} (Target: {intent_perf['target']:.3f}) - Grade: {intent_perf['score']}")
        
        # Entity extraction
        entity_perf = performance["entity_extraction"]
        entity_status_icon = "✅" if entity_perf["status"] == "PASS" else "❌"
        print(f"{entity_status_icon} Entity Extraction F1: {entity_perf['f1_score']:.3f} (Target: {entity_perf['target']:.3f}) - Grade: {entity_perf['score']}")
        print(f"   └─ Precision: {entity_perf['precision']:.3f}")
        print(f"   └─ Recall: {entity_perf['recall']:.3f}")
        
        # Overall assessment
        overall_pass = (intent_perf["status"] == "PASS" and entity_perf["status"] == "PASS")
        overall_icon = "🎉" if overall_pass else "⚠️"
        overall_status = "ALL TESTS PASSED" if overall_pass else "IMPROVEMENTS NEEDED"
        print(f"\n{overall_icon} OVERALL: {overall_status}")
        
        # Recommendations
        if report["recommendations"]:
            print(f"\n💡 RECOMMENDATIONS:")
            print("-" * 30)
            for i, rec in enumerate(report["recommendations"], 1):
                print(f"{i}. {rec['category']}: {rec['issue']}")
                print(f"   → {rec['suggestion']}")
                
        print("\n" + "="*60)
        print("📁 Detailed results available in:")
        print("   • comprehensive_nlu_test_report.json")
        print("   • nlu_test_summary.csv")
        print("   • nlu_test_results.json")
        print("   • entity_test_results.json")
        print("="*60)


async def main():
    """Main comprehensive test runner"""
    test_suite = ComprehensiveNLUTestSuite()
    
    try:
        await test_suite.run_all_tests()
        print("\n🎉 All comprehensive tests completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Tests failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
