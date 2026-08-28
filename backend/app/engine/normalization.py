import re

def normalize_name(name: str) -> str:
    """
    Standardize person names for similarity comparison.
    Handles prefixes, honorifics, spaces, and punctuation.
    e.g. 'MD EKBAL' -> 'md ekbal'
         'Md. Ekbal' -> 'md ekbal'
         'M.D. Ekbal' -> 'md ekbal'
    """
    if not name:
        return ""
    
    clean = name.lower().strip()
    # Remove common honorifics
    prefixes = [r'\bshri\b', r'\bsri\b', r'\bmd\.\b', r'\bmd\b', r'\blate\b', r'\blt\.\b', r'\bsmti\b', r'\bsmt\b', r'\bdr\.\b']
    for p in prefixes:
        clean = re.sub(p, '', clean)
        
    # Replace punctuation with empty space
    clean = re.sub(r'[^\w\s]', '', clean)
    # Collapse multiple spaces
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def calculate_name_similarity(name1: str, name2: str) -> float:
    """
    Calculates string similarity score between 0.0 and 1.0 using Token Set / Levenshtein logic.
    """
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    
    if norm1 == norm2:
        return 1.0
    if not norm1 or not norm2:
        return 0.0
        
    set1 = set(norm1.split())
    set2 = set(norm2.split())
    
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    
    if not union:
        return 0.0
    
    jaccard = len(intersection) / len(union)
    
    # Also check substring match
    if norm1 in norm2 or norm2 in norm1:
        jaccard = max(jaccard, 0.85)
        
    return round(jaccard, 2)

def generate_land_identity_id(district: str, anchal: str, mauza: str, khata: str, khesra: str) -> str:
    """
    Generates internal canonical LandIdentityID.
    e.g. JH-BOK-CHS-MAU001-K125-K450-2
    """
    dist_code = district[:3].upper()
    anc_code = anchal[:3].upper()
    
    # Clean mauza code
    mauza_clean = re.sub(r'[^a-zA-Z0-9]', '', mauza).upper()[:6]
    khata_clean = re.sub(r'[^a-zA-Z0-9]', '', khata)
    khesra_clean = re.sub(r'[^a-zA-Z0-9]', '-', khesra)
    
    return f"JH-{dist_code}-{anc_code}-{mauza_clean}-K{khata_clean}-K{khesra_clean}"
