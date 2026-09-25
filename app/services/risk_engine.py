# Risk score calculation logic
PRIORITY_WEIGHT = {"Critical": 40, "High": 30, "Medium": 20, "Low": 10}

def get_risk_score(category: str, people_affected: int, priority: str) -> float:
    score = PRIORITY_WEIGHT.get(priority, 10) + min(people_affected * 2, 30)
    return min(score, 100)