from textblob import TextBlob


def analyze_reviews(reviews):
    positive = 0
    negative = 0
    neutral = 0

    for review in reviews:

        text = review["review_text"]

        polarity = TextBlob(text).sentiment.polarity

        if polarity > 0:
            positive += 1

        elif polarity < 0:
            negative += 1

        else:
            neutral += 1

    total = len(reviews)

    if total == 0:
        return {
            "positive": 0,
            "negative": 0,
            "neutral": 0
        }

    return {
        "positive": round((positive / total) * 100, 2),
        "negative": round((negative / total) * 100, 2),
        "neutral": round((neutral / total) * 100, 2)
    }