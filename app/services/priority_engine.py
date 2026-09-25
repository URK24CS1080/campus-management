# Priority calculation logic
CATEGORY_BASE_PRIORITY = {
    "Fire": "Critical", "Medical": "Critical", "Electrical": "High",
    "Security": "High", "Water": "Medium", "Infrastructure": "Medium", "IT": "Low"
}

def get_priority(category: str, people_affected: int) -> str:
    base = CATEGORY_BASE_PRIORITY.get(category, "Medium")
    if people_affected > 20 and base != "Critical":
        return "Critical"
    return base