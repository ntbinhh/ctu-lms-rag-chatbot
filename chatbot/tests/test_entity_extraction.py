"""
Entity Extraction Performance Tests
Tests specifically for entity recognition accuracy
"""

import asyncio
import json
import re
from typing import Dict, List, Tuple
from pathlib import Path

class EntityExtractionTester:
    """Dedicated Entity Extraction Testing"""
    
    def __init__(self):
        self.entity_test_cases = []
        
    def load_entity_test_data(self):
        """Load test cases with specific entity annotations"""
        self.entity_test_cases = [
            # Năm entity tests
            {
                "text": "học phí năm 2025 là bao nhiêu",
                "entities": [{"entity": "nam", "value": "2025", "start": 12, "end": 16}]
            },
            {
                "text": "tuyển sinh năm học 2024-2025",
                "entities": [{"entity": "nam", "value": "2024-2025", "start": 19, "end": 28}]
            },
            {
                "text": "chương trình đào tạo từ năm 2023",
                "entities": [{"entity": "nam", "value": "2023", "start": 28, "end": 32}]
            },
            
            # Ngành entity tests
            {
                "text": "chương trình đào tạo công nghệ thông tin",
                "entities": [{"entity": "nganh", "value": "công nghệ thông tin", "start": 22, "end": 41}]
            },
            {
                "text": "tôi muốn học ngành kế toán",
                "entities": [{"entity": "nganh", "value": "kế toán", "start": 19, "end": 26}]
            },
            {
                "text": "điều kiện tuyển sinh ngành quản trị kinh doanh",
                "entities": [{"entity": "nganh", "value": "quản trị kinh doanh", "start": 27, "end": 46}]
            },
            
            # Học kỳ entity tests  
            {
                "text": "lịch thi học kỳ 1 năm 2025",
                "entities": [
                    {"entity": "hoc_ky", "value": "1", "start": 15, "end": 16},
                    {"entity": "nam", "value": "2025", "start": 22, "end": 26}
                ]
            },
            {
                "text": "đăng ký môn học semester 2",
                "entities": [{"entity": "hoc_ky", "value": "2", "start": 24, "end": 25}]
            },
            
            # Cơ sở entity tests
            {
                "text": "học phí tại cơ sở Cần Thơ",
                "entities": [{"entity": "co_so", "value": "Cần Thơ", "start": 18, "end": 25}]
            },
            {
                "text": "tuyển sinh cơ sở An Giang",
                "entities": [{"entity": "co_so", "value": "An Giang", "start": 17, "end": 25}]
            },
            
            # Loại đào tạo entity tests
            {
                "text": "học phí đào tạo từ xa",
                "entities": [{"entity": "loai_dao_tao", "value": "từ xa", "start": 16, "end": 21}]
            },
            {
                "text": "chương trình chính quy",
                "entities": [{"entity": "loai_dao_tao", "value": "chính quy", "start": 13, "end": 23}]
            },
            
            # Mixed entity tests
            {
                "text": "học phí ngành công nghệ thông tin tại cơ sở Cần Thơ năm 2025",
                "entities": [
                    {"entity": "nganh", "value": "công nghệ thông tin", "start": 14, "end": 33},
                    {"entity": "co_so", "value": "Cần Thơ", "start": 44, "end": 51},
                    {"entity": "nam", "value": "2025", "start": 56, "end": 60}
                ]
            },
            
            # No entity tests
            {
                "text": "xin chào tôi cần hỗ trợ",
                "entities": []
            },
            {
                "text": "cảm ơn bạn đã giúp đỡ",
                "entities": []
            }
        ]
        
    def manual_entity_extraction(self, text: str) -> List[Dict]:
        """Manual rule-based entity extraction for comparison"""
        entities = []
        text_lower = text.lower()
        
        # Year patterns
        year_patterns = [
            r'\b(20\d{2})\b',  # 2025, 2024, etc.
            r'\b(20\d{2}-20\d{2})\b',  # 2024-2025
        ]
        
        for pattern in year_patterns:
            for match in re.finditer(pattern, text):
                entities.append({
                    "entity": "nam",
                    "value": match.group(1),
                    "start": match.start(),
                    "end": match.end()
                })
        
        # Ngành patterns
        nganh_keywords = [
            "công nghệ thông tin", "kế toán", "quản trị kinh doanh", 
            "kinh tế", "luật", "nông nghiệp", "thủy sản", "y học"
        ]
        
        for keyword in nganh_keywords:
            start = text_lower.find(keyword)
            if start != -1:
                entities.append({
                    "entity": "nganh",
                    "value": keyword,
                    "start": start,
                    "end": start + len(keyword)
                })
        
        # Học kỳ patterns
        hoc_ky_patterns = [
            r'học kỳ (\d)',
            r'semester (\d)',
            r'kỳ (\d)'
        ]
        
        for pattern in hoc_ky_patterns:
            for match in re.finditer(pattern, text_lower):
                entities.append({
                    "entity": "hoc_ky", 
                    "value": match.group(1),
                    "start": match.start(1),
                    "end": match.end(1)
                })
        
        # Cơ sở patterns
        co_so_keywords = ["Cần Thơ", "An Giang", "Hậu Giang", "Sóc Trăng", "Bạc Liêu"]
        
        for keyword in co_so_keywords:
            start = text.find(keyword)
            if start != -1:
                entities.append({
                    "entity": "co_so",
                    "value": keyword,
                    "start": start,
                    "end": start + len(keyword)
                })
                
        # Loại đào tạo patterns
        loai_dao_tao_keywords = ["từ xa", "chính quy", "liên thông"]
        
        for keyword in loai_dao_tao_keywords:
            start = text_lower.find(keyword)
            if start != -1:
                entities.append({
                    "entity": "loai_dao_tao",
                    "value": keyword,
                    "start": start,
                    "end": start + len(keyword)
                })
        
        return entities
        
    async def test_rasa_entity_extraction(self):
        """Test entity extraction using RASA"""
        try:
            from rasa.core.agent import Agent
            import os
            
            # Load latest model
            model_dir = Path("models")
            if not model_dir.exists():
                return None
                
            model_files = list(model_dir.glob("*.tar.gz"))
            if not model_files:
                return None
                
            latest_model = max(model_files, key=os.path.getctime)
            agent = Agent.load(str(latest_model))
            
            results = {
                "total_cases": len(self.entity_test_cases),
                "entity_results": [],
                "by_entity_type": {},
                "overall_metrics": {}
            }
            
            all_true_entities = []
            all_pred_entities = []
            
            for test_case in self.entity_test_cases:
                rasa_result = await agent.parse_message(test_case["text"])
                
                true_entities = test_case["entities"]
                pred_entities = rasa_result["entities"]
                
                # Convert to comparable format
                true_set = set((e["entity"], e["value"]) for e in true_entities)
                pred_set = set((e["entity"], e["value"]) for e in pred_entities)
                
                all_true_entities.extend(true_set)
                all_pred_entities.extend(pred_set)
                
                case_result = {
                    "text": test_case["text"],
                    "true_entities": true_entities,
                    "pred_entities": pred_entities,
                    "true_count": len(true_entities),
                    "pred_count": len(pred_entities),
                    "correct_count": len(true_set & pred_set),
                    "precision": len(true_set & pred_set) / len(pred_set) if pred_set else 1.0,
                    "recall": len(true_set & pred_set) / len(true_set) if true_set else 1.0
                }
                
                results["entity_results"].append(case_result)
            
            # Calculate overall metrics
            all_true_set = set(all_true_entities)
            all_pred_set = set(all_pred_entities)
            
            overall_precision = len(all_true_set & all_pred_set) / len(all_pred_set) if all_pred_set else 1.0
            overall_recall = len(all_true_set & all_pred_set) / len(all_true_set) if all_true_set else 1.0
            overall_f1 = 2 * overall_precision * overall_recall / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0.0
            
            results["overall_metrics"] = {
                "precision": overall_precision,
                "recall": overall_recall,
                "f1": overall_f1,
                "total_true_entities": len(all_true_set),
                "total_pred_entities": len(all_pred_set),
                "total_correct": len(all_true_set & all_pred_set)
            }
            
            # Calculate by entity type
            entity_types = set(e[0] for e in all_true_entities) | set(e[0] for e in all_pred_entities)
            
            for entity_type in entity_types:
                type_true = set(e for e in all_true_entities if e[0] == entity_type)
                type_pred = set(e for e in all_pred_entities if e[0] == entity_type)
                
                type_precision = len(type_true & type_pred) / len(type_pred) if type_pred else 1.0
                type_recall = len(type_true & type_pred) / len(type_true) if type_true else 1.0
                type_f1 = 2 * type_precision * type_recall / (type_precision + type_recall) if (type_precision + type_recall) > 0 else 0.0
                
                results["by_entity_type"][entity_type] = {
                    "precision": type_precision,
                    "recall": type_recall,
                    "f1": type_f1,
                    "true_count": len(type_true),
                    "pred_count": len(type_pred),
                    "correct_count": len(type_true & type_pred)
                }
            
            return results
            
        except ImportError:
            print("⚠️ RASA not available for entity testing")
            return None
        except Exception as e:
            print(f"❌ RASA entity test error: {e}")
            return None
            
    def test_manual_entity_extraction(self):
        """Test manual entity extraction"""
        results = {
            "total_cases": len(self.entity_test_cases),
            "entity_results": [],
            "by_entity_type": {},
            "overall_metrics": {}
        }
        
        all_true_entities = []
        all_pred_entities = []
        
        for test_case in self.entity_test_cases:
            true_entities = test_case["entities"]
            pred_entities = self.manual_entity_extraction(test_case["text"])
            
            # Convert to comparable format
            true_set = set((e["entity"], e["value"]) for e in true_entities)
            pred_set = set((e["entity"], e["value"]) for e in pred_entities)
            
            all_true_entities.extend(true_set)
            all_pred_entities.extend(pred_set)
            
            case_result = {
                "text": test_case["text"],
                "true_entities": true_entities,
                "pred_entities": pred_entities,
                "true_count": len(true_entities),
                "pred_count": len(pred_entities),
                "correct_count": len(true_set & pred_set),
                "precision": len(true_set & pred_set) / len(pred_set) if pred_set else 1.0,
                "recall": len(true_set & pred_set) / len(true_set) if true_set else 1.0
            }
            
            results["entity_results"].append(case_result)
        
        # Calculate overall metrics (same as RASA method)
        all_true_set = set(all_true_entities)
        all_pred_set = set(all_pred_entities)
        
        overall_precision = len(all_true_set & all_pred_set) / len(all_pred_set) if all_pred_set else 1.0
        overall_recall = len(all_true_set & all_pred_set) / len(all_true_set) if all_true_set else 1.0
        overall_f1 = 2 * overall_precision * overall_recall / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0.0
        
        results["overall_metrics"] = {
            "precision": overall_precision,
            "recall": overall_recall,
            "f1": overall_f1,
            "total_true_entities": len(all_true_set),
            "total_pred_entities": len(all_pred_set),
            "total_correct": len(all_true_set & all_pred_set)
        }
        
        # Calculate by entity type
        entity_types = set(e[0] for e in all_true_entities) | set(e[0] for e in all_pred_entities)
        
        for entity_type in entity_types:
            type_true = set(e for e in all_true_entities if e[0] == entity_type)
            type_pred = set(e for e in all_pred_entities if e[0] == entity_type)
            
            type_precision = len(type_true & type_pred) / len(type_pred) if type_pred else 1.0
            type_recall = len(type_true & type_pred) / len(type_true) if type_true else 1.0
            type_f1 = 2 * type_precision * type_recall / (type_precision + type_recall) if (type_precision + type_recall) > 0 else 0.0
            
            results["by_entity_type"][entity_type] = {
                "precision": type_precision,
                "recall": type_recall,
                "f1": type_f1,
                "true_count": len(type_true),
                "pred_count": len(type_pred),
                "correct_count": len(type_true & type_pred)
            }
        
        return results
        
    async def run_entity_tests(self):
        """Run all entity extraction tests"""
        print("🏷️ Starting Entity Extraction Tests")
        print("="*50)
        
        self.load_entity_test_data()
        print(f"📋 Loaded {len(self.entity_test_cases)} entity test cases")
        
        # Test RASA entity extraction
        print("\n🤖 Testing RASA Entity Extraction...")
        rasa_results = await self.test_rasa_entity_extraction()
        
        # Test manual entity extraction  
        print("\n📝 Testing Manual Entity Extraction...")
        manual_results = self.test_manual_entity_extraction()
        
        # Generate report
        report = {
            "timestamp": asyncio.get_event_loop().time(),
            "test_summary": {
                "total_test_cases": len(self.entity_test_cases),
                "entity_types_tested": list(set(e["entity"] for case in self.entity_test_cases for e in case["entities"]))
            },
            "rasa_entity_results": rasa_results,
            "manual_entity_results": manual_results
        }
        
        # Print results
        print("\n" + "="*50)
        print("🏷️ ENTITY EXTRACTION RESULTS")
        print("="*50)
        
        if rasa_results:
            metrics = rasa_results["overall_metrics"]
            print(f"🤖 RASA Entity Extraction:")
            print(f"   Precision: {metrics['precision']:.3f}")
            print(f"   Recall:    {metrics['recall']:.3f}")
            print(f"   F1 Score:  {metrics['f1']:.3f}")
            
            # Performance assessment
            f1_threshold = 0.92
            status = "✅ PASS" if metrics['f1'] >= f1_threshold else "❌ FAIL"
            print(f"   Status:    {status} (Target: F1 ≥ {f1_threshold})")
            
            print(f"\n   By Entity Type:")
            for entity_type, type_metrics in rasa_results["by_entity_type"].items():
                print(f"     {entity_type}: F1={type_metrics['f1']:.3f}, P={type_metrics['precision']:.3f}, R={type_metrics['recall']:.3f}")
        
        if manual_results:
            metrics = manual_results["overall_metrics"] 
            print(f"\n📝 Manual Entity Extraction:")
            print(f"   Precision: {metrics['precision']:.3f}")
            print(f"   Recall:    {metrics['recall']:.3f}")
            print(f"   F1 Score:  {metrics['f1']:.3f}")
        
        # Save results
        print(f"\n💾 Saving entity test results...")
        with open("entity_test_results.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print("✅ Results saved to entity_test_results.json")
        
        return report


async def main():
    """Main entity test runner"""
    tester = EntityExtractionTester()
    
    try:
        await tester.run_entity_tests()
        print("\n✅ Entity extraction tests completed!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Tests failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
