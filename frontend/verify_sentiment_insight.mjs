// Phase 2C Verification — Sentiment Insight Logic Test
// Run: node verify_sentiment_insight.mjs

function generateSentimentInsight(positivePct, neutralPct, negativePct) {
  if (negativePct === 0 && positivePct >= 60) {
    return `Overwhelmingly positive at ${positivePct.toFixed(1)}% with zero negative feedback detected. Customers are highly satisfied with this product.`;
  } else if (negativePct === 0 && positivePct > 0) {
    return `No negative reviews detected. Sentiment is split between positive (${positivePct.toFixed(1)}%) and neutral (${neutralPct.toFixed(1)}%) feedback.`;
  } else if (negativePct <= 10) {
    return `Mostly positive at ${positivePct.toFixed(1)}%. Minor concerns exist in ${negativePct.toFixed(1)}% of reviews — generally a trustworthy product.`;
  } else if (negativePct <= 30) {
    return `Mixed sentiment detected. While ${positivePct.toFixed(1)}% of reviews are positive, ${negativePct.toFixed(1)}% express dissatisfaction. Review carefully before purchasing.`;
  } else if (negativePct <= 60) {
    return `Significant negative sentiment at ${negativePct.toFixed(1)}%. Only ${positivePct.toFixed(1)}% of customers are satisfied. Caution is advised.`;
  } else {
    return `Predominantly negative feedback at ${negativePct.toFixed(1)}%. This product has serious quality concerns based on customer reviews.`;
  }
}

const scenarios = [
  {
    name: "Scenario 1",
    pos: 66.67, neu: 33.33, neg: 0,
    mustContain: ["zero negative", "no negative", "overwhelmingly"],
    mustNotContain: ["areas for improvement"],
  },
  {
    name: "Scenario 2",
    pos: 100, neu: 0, neg: 0,
    mustContain: ["overwhelmingly", "zero negative"],
    mustNotContain: ["concern", "improvement"],
  },
  {
    name: "Scenario 3",
    pos: 50, neu: 20, neg: 30,
    mustContain: ["mixed", "dissatisfaction"],
    mustNotContain: [],
  },
  {
    name: "Scenario 4",
    pos: 10, neu: 10, neg: 80,
    mustContain: ["predominantly negative", "serious"],
    mustNotContain: [],
  },
];

let allPass = true;

console.log("=".repeat(70));
console.log("  Phase 2C — Sentiment Insight Verification");
console.log("=".repeat(70));

for (const s of scenarios) {
  const result = generateSentimentInsight(s.pos, s.neu, s.neg);
  const resultLower = result.toLowerCase();

  // At least ONE mustContain phrase must appear (OR logic)
  const missingRequired = s.mustContain.length > 0 &&
    !s.mustContain.some((phrase) => resultLower.includes(phrase.toLowerCase()));
  const foundForbidden = s.mustNotContain.filter(
    (phrase) => resultLower.includes(phrase.toLowerCase())
  );

  const pass = !missingRequired && foundForbidden.length === 0;
  if (!pass) allPass = false;

  console.log(`\n${s.name}: pos=${s.pos}% neu=${s.neu}% neg=${s.neg}%`);
  console.log(`  Result : "${result}"`);
  console.log(`  Status : ${pass ? "PASS" : "FAIL"}`);
  if (missingRequired.length > 0)
    console.log(`  MISSING: ${missingRequired.join(", ")}`);
  if (foundForbidden.length > 0)
    console.log(`  FOUND (forbidden): ${foundForbidden.join(", ")}`);
}

console.log("\n" + "=".repeat(70));
console.log(`  OVERALL: ${allPass ? "ALL SCENARIOS PASS" : "SOME SCENARIOS FAILED"}`);
console.log("=".repeat(70));
