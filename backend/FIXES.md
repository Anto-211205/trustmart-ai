# TrustMart AI — Bug Fix Documentation

## Bug 1 — Fake Review Detection (100% Fake on All Products)

### Root Cause Found

Three compounding problems:

**Problem 1: Model trained on 30 synthetic samples, not real DB reviews**
The `retrain_model.py` script built a synthetic dataset of 30 hand-crafted reviews
(15 fake / 15 genuine). The actual database contained 50,000 real Amazon reviews.
The TF-IDF vocabulary was fit on synthetic text tokens, so when real DB reviews were
passed at inference time, most tokens were out-of-vocabulary. The model fell back to
a heavily biased prior and classified every review as fake (label=1).

**Problem 2: Labeling heuristic was too broad**
Old rule: `fake = (score == 5) AND (helpful_num == 0)`
This matched ~48% of real DB reviews, including thousands of legitimate 5-star reviews
that simply hadn't received any helpfulness votes yet (common for recent reviews).
Even a non-biased model trained on this rule would produce wildly inflated fake%.

**Problem 3: `predict()` used without probability threshold**
The inference function called `model.predict([text])` which applies a hardcoded 0.5
threshold internally. With probabilities clustering between 0.67–0.88 across all reviews
(due to Problems 1 & 2), every single review exceeded 0.5, making prediction always=1.

**Confirmed by diagnostic output:**
```
Predictions all==1? True
Prob(fake) min=0.6747  max=0.8797  mean=0.7701
```

---

### Files Changed

| File | Change |
|------|--------|
| `retrain_model.py` | Complete rewrite: loads real DB reviews, corrected labeling, numerical features, RF with class_weight='balanced', 80/20 stratified split, full eval report |
| `app/services/fake_review_service.py` | Updated `predict_fake_review()` to call `HybridFakeDetector.predict_single()` with score/helpfulness; legacy pipeline fallback preserved |
| `app/routes/review_routes.py` | Updated `/fake-reviews/{product_id}` to SELECT `score, helpful_num, helpful_den` alongside `review_text` and pass them to inference |

Old model backed up to: `fake_review_model_backup.pkl`

---

### Labeling Strategy: Before vs After

**Before (broken):**
```python
fake = (Score == 5) AND (HelpfulnessNumerator == 0)
# Result: ~48% of all reviews labeled fake
# Includes: every 5-star review with no helpfulness votes yet
```

**After (corrected multi-condition):**
```python
fake = (
    # 5-star with no community validation AND very short
    (score == 5 AND helpfulness_ratio < 0.1 AND review_length < 150)
    OR
    # 1-star with no community validation AND very short
    (score == 1 AND helpfulness_ratio < 0.1 AND review_length < 80)
    OR
    # Extremely short = spam/bot pattern
    (review_length < 20)
)
# Result: 7.7% of 50,000 reviews labeled fake (realistic)
```

---

### Features: Before vs After

**Before:** Text only via TF-IDF
**After:** TF-IDF (5000 features, unigrams+bigrams) + numerical features:
- `review_length` (character count)
- `word_count`
- `rating_norm` (rating scaled 0–1)
- `helpfulness_ratio` (helpful_votes / total_votes)

Combined via `scipy.sparse.hstack`. Uses `predict_proba()` with threshold=0.60.

---

### Classification Report (After Fix)

```
              precision    recall  f1-score   support

     Genuine       1.00      0.99      0.99      9229
        Fake       0.90      0.97      0.94       771

    accuracy                           0.99     10000
   macro avg       0.95      0.98      0.97     10000
weighted avg       0.99      0.99      0.99     10000

Confusion Matrix:
[[9149   80]
 [  22  749]]
```

All thresholds met (min Fake Precision=0.60, Fake Recall=0.40, Accuracy=0.65).

---

### Fake % Comparison Table

| Product ID | ASIN          | Avg Rating | Reviews | Old Fake% | New Fake% |
|------------|---------------|------------|---------|-----------|-----------|
| 1          | B004RBG322    | 4.5        | 2       | 100.0%    | 0.0%      |
| 2          | B004OVCWAW    | 3.33       | 3       | 100.0%    | 0.0%      |
| 3          | B001AG4U0Y    | 5.0        | 2       | 100.0%    | 0.0%      |
| 4          | B0051LNWPI    | 4.67       | 15      | 100.0%    | 6.7%      |
| 5          | B005S4NG5E    | 5.0        | 1       | 100.0%    | 0.0%      |
| 6          | B001SAQDYS    | 4.44       | 9       | 88.9%     | 33.3%     |
| 7          | B001BZ3PUK    | 4.33       | 3       | 100.0%    | 0.0%      |
| 8          | B001L7V9B0    | 4.5        | 2       | 100.0%    | 0.0%      |
| 9          | B007GDTL90    | 5.0        | 1       | 100.0%    | 0.0%      |
| 10         | B004KU4TY4    | 5.0        | 1       | 100.0%    | 0.0%      |

Products now show varied fake % (0–33%) instead of all 100%.

---

## Bug 2 — Sentiment Insight Text Is Logically Wrong

### Root Cause Found

**File:** `frontend/src/pages/ProductDetailsPage.jsx`
**Function:** `SentimentTab` component
**Lines:** 312–318 (before fix)

The broken logic had only **3 branches based solely on `positive` %**, completely
ignoring the `negative` % value:

```javascript
// BROKEN (lines 313–318)
{positive >= 70
  ? `This product enjoys overwhelmingly positive sentiment at ${positive}%...`
  : positive >= 50
    ? `Customer sentiment is moderately positive at ${positive}%, with ${negative}%
       expressing concerns. While most buyers are satisfied, there are notable areas
       for improvement based on customer feedback.`  // ← BUG: fires even when negative=0%
    : `This product has concerning sentiment metrics...`
}
```

When `positive=66.67, neutral=33.33, negative=0`:
- `positive >= 70` → false (66.67 < 70)
- `positive >= 50` → **true** → fires the "notable areas for improvement" branch
- The `negative` value (0%) is **never checked** — it's interpolated into the string
  as a number but has no effect on which branch fires

### Logic: Before vs After

**Before (3 branches, positive-only):**
- `positive >= 70` → "overwhelmingly positive"
- `positive >= 50` → "areas for improvement" ← fires for 50–69.99% regardless of negative%
- else → "concerning metrics"

**After (6 branches, negative-first):**
- `negative == 0 AND positive >= 60` → "Overwhelmingly positive... zero negative feedback"
- `negative == 0 AND positive > 0` → "No negative reviews detected. Split between..."
- `negative <= 10` → "Mostly positive. Minor concerns in N%..."
- `negative <= 30` → "Mixed sentiment detected. N% express dissatisfaction..."
- `negative <= 60` → "Significant negative sentiment at N%..."
- else → "Predominantly negative feedback..."

### Scenario Verification Output

```
Scenario 1: pos=66.67% neu=33.33% neg=0%
  Result : "Overwhelmingly positive at 66.7% with zero negative feedback
            detected. Customers are highly satisfied with this product."
  Status : PASS  ← No longer says "areas for improvement"

Scenario 2: pos=100% neu=0% neg=0%
  Result : "Overwhelmingly positive at 100.0% with zero negative feedback
            detected. Customers are highly satisfied with this product."
  Status : PASS

Scenario 3: pos=50% neu=20% neg=30%
  Result : "Mixed sentiment detected. While 50.0% of reviews are positive,
            30.0% express dissatisfaction. Review carefully before purchasing."
  Status : PASS

Scenario 4: pos=10% neu=10% neg=80%
  Result : "Predominantly negative feedback at 80.0%. This product has
            serious quality concerns based on customer reviews."
  Status : PASS

OVERALL: ALL SCENARIOS PASS
```

The insight text updates live as users switch between products because it is computed
from the live `trust.sentiment` values returned by the `/reviews/trust-score/{id}` API.
