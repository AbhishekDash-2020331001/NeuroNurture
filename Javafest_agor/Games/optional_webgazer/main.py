from Levenshtein import distance as levenshtein_distance

def sentence_similarity(target_sentence, spoken_sentence):
    """
    Compute similarity between two sentences (Bangla or any language)
    Returns a percentage (0-100) of similarity
    """
    # Compute edit distance
    dist = levenshtein_distance(target_sentence, spoken_sentence)
    # Normalize by the length of the longer sentence
    max_len = max(len(target_sentence), len(spoken_sentence))
    similarity = (1 - dist / max_len) * 100
    return round(similarity, 2)

# Example usage
target_sentence = "আমি স্কুলে যাবো"
spoken_sentence = "আমি স্কুল যাবি"

score = sentence_similarity(target_sentence, spoken_sentence)
print(f"Similarity: {score}%")
