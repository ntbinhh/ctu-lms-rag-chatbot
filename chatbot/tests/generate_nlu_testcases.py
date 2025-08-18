"""
Script to generate NLU test cases from nlu.yml
Extracts all examples for each intent and saves to JSON for automated testing
"""
import yaml
import json
from pathlib import Path

def load_nlu_examples(nlu_path):
    with open(nlu_path, 'r', encoding='utf-8') as f:
        nlu_data = yaml.safe_load(f)
    
    test_cases = []
    for item in nlu_data.get('nlu', []):
        intent = item.get('intent')
        examples = item.get('examples', '')
        # Split examples by line, remove leading '-'
        for line in examples.split('\n'):
            line = line.strip()
            if line.startswith('- '):
                example = line[2:].strip()
                if example:
                    test_cases.append({
                        "text": example,
                        "intent": intent,
                        "entities": []  # Add entity annotation if available
                    })
    return test_cases

def save_testcases(test_cases, out_path):
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(test_cases, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(test_cases)} test cases to {out_path}")

if __name__ == "__main__":
    nlu_path = str(Path(__file__).parent.parent / "data" / "nlu.yml")
    out_path = str(Path(__file__).parent / "nlu_testcases.json")
    test_cases = load_nlu_examples(nlu_path)
    save_testcases(test_cases, out_path)
