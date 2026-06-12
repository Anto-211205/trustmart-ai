def calculate_trust_score(stats, sentiment):

    rating_score = (stats["avg_rating"] / 5) * 50

    positive_score = (
        sentiment["positive"] / 100
    ) * 50

    trust_score = rating_score + positive_score

    return round(trust_score, 2)