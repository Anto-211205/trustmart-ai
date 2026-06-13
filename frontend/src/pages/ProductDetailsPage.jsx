import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Smile,
  MessageSquare,
  Eye,
  TrendingUp,
  Brain,
  BarChart3,
  Cpu,
  Info,
} from 'lucide-react';
import {
  getProductReviews,
  getProductStats,
  getTrustScore,
  getFakeReviews,
} from '../services/api';
import ProductHero from '../components/product/ProductHero';
import StatCard from '../components/product/StatCard';
import TrustGauge from '../components/product/TrustGauge';
import SentimentDonut from '../components/product/SentimentDonut';
import FakeDetectionBar from '../components/product/FakeDetectionBar';
import RatingDistribution from '../components/product/RatingDistribution';
import ReviewCard from '../components/product/ReviewCard';
import TabBar from '../components/ui/TabBar';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GlassCard from '../components/ui/GlassCard';
import SentimentBar from '../components/ui/SentimentBar';
import { SkeletonDetailHero, SkeletonStatCards } from '../components/ui/SkeletonLoader';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'sentiment', label: 'Sentiment', icon: Smile },
  { id: 'fake', label: 'Fake Detection', icon: AlertTriangle },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
];

function getVerdict(score) {
  if (score >= 80) return { text: 'Excellent — This product is highly trustworthy with overwhelmingly positive and authentic reviews.', color: 'emerald', icon: ShieldCheck };
  if (score >= 60) return { text: 'Good — This product appears generally reliable with mostly positive sentiment.', color: 'emerald', icon: ShieldCheck };
  if (score >= 40) return { text: 'Moderate — This product has mixed signals. Some reviews may be unreliable.', color: 'amber', icon: Info };
  return { text: 'Caution — This product shows significant trust issues. Proceed with care.', color: 'red', icon: AlertTriangle };
}

function getRiskLevel(fakePct) {
  if (fakePct <= 10) return { label: 'Low Risk', color: 'emerald', bg: 'bg-[var(--color-emerald-bg)]', text: 'text-[var(--color-emerald)]', border: 'border-[var(--color-emerald-border)]' };
  if (fakePct <= 30) return { label: 'Medium Risk', color: 'amber', bg: 'bg-[var(--color-amber-bg)]', text: 'text-[var(--color-amber)]', border: 'border-[var(--color-amber-border)]' };
  return { label: 'High Risk', color: 'red', bg: 'bg-[var(--color-red-bg)]', text: 'text-[var(--color-red)]', border: 'border-[var(--color-red-border)]' };
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [trust, setTrust] = useState(null);
  const [fakeData, setFakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, statsData, trustData, fakeReviewData] = await Promise.all([
        getProductReviews(id),
        getProductStats(id),
        getTrustScore(id),
        getFakeReviews(id),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      setTrust(trustData);
      setFakeData(fakeReviewData);
    } catch (err) {
      setError(err?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonDetailHero />
        <SkeletonStatCards />
        <div className="skeleton h-12 w-full rounded-[var(--radius-lg)]" />
        <div className="skeleton h-64 w-full rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  const verdict = trust ? getVerdict(trust.trust_score) : null;
  const risk = fakeData ? getRiskLevel(fakeData.fake_percentage) : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <ProductHero id={id} stats={stats} trust={trust} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShieldCheck} label="Trust Score" color="indigo" delay={0}>
          <AnimatedCounter value={trust?.trust_score || 0} suffix="%" className="text-2xl font-bold" />
        </StatCard>
        <StatCard icon={AlertTriangle} label="Fake Reviews" color="red" delay={0.1}>
          <AnimatedCounter value={fakeData?.fake_percentage || 0} suffix="%" decimals={1} className="text-2xl font-bold" />
        </StatCard>
        <StatCard icon={Smile} label="Positive Sentiment" color="emerald" delay={0.2}>
          <AnimatedCounter value={trust?.sentiment?.positive || 0} suffix="%" decimals={1} className="text-2xl font-bold" />
        </StatCard>
        <StatCard icon={MessageSquare} label="Total Reviews" color="amber" delay={0.3}>
          <AnimatedCounter value={fakeData?.total_reviews || 0} className="text-2xl font-bold" />
        </StatCard>
      </div>

      {/* Tab Bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab trust={trust} verdict={verdict} reviews={reviews} />
          )}
          {activeTab === 'sentiment' && (
            <SentimentTab trust={trust} />
          )}
          {activeTab === 'fake' && (
            <FakeDetectionTab fakeData={fakeData} risk={risk} />
          )}
          {activeTab === 'reviews' && (
            <ReviewsTab reviews={reviews} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ TAB: OVERVIEW ═══════════════ */
function OverviewTab({ trust, verdict, reviews }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trust Gauge */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--color-accent-indigo)]" />
          Trust Score
        </h3>
        <TrustGauge score={trust?.trust_score || 0} />
      </GlassCard>

      {/* AI Verdict */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Brain size={16} className="text-[var(--color-accent-indigo)]" />
          AI Verdict
        </h3>
        {verdict && (
          <div className={`p-4 rounded-[var(--radius-md)] border ${
            verdict.color === 'emerald' ? 'bg-[var(--color-emerald-bg)] border-[var(--color-emerald-border)]' :
            verdict.color === 'amber' ? 'bg-[var(--color-amber-bg)] border-[var(--color-amber-border)]' :
            'bg-[var(--color-red-bg)] border-[var(--color-red-border)]'
          }`}>
            <div className="flex items-start gap-3">
              <verdict.icon size={20} className={
                verdict.color === 'emerald' ? 'text-[var(--color-emerald)] mt-0.5' :
                verdict.color === 'amber' ? 'text-[var(--color-amber)] mt-0.5' :
                'text-[var(--color-red)] mt-0.5'
              } />
              <p className={`text-sm leading-relaxed ${
                verdict.color === 'emerald' ? 'text-[var(--color-emerald)]' :
                verdict.color === 'amber' ? 'text-[var(--color-amber)]' :
                'text-[var(--color-red)]'
              }`}>
                {verdict.text}
              </p>
            </div>
          </div>
        )}

        {/* Sentiment summary */}
        {trust?.sentiment && (
          <div className="mt-6">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Sentiment Breakdown</p>
            <SentimentBar
              positive={trust.sentiment.positive}
              neutral={trust.sentiment.neutral}
              negative={trust.sentiment.negative}
              height="h-3"
              showLabels
            />
          </div>
        )}
      </GlassCard>

      {/* Rating Distribution */}
      <GlassCard hover={false} className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--color-accent-indigo)]" />
          Rating Distribution
        </h3>
        <RatingDistribution reviews={reviews} />
      </GlassCard>
    </div>
  );
}

/* ═══════════════ SENTIMENT INSIGHT GENERATOR ═══════════════ */
/**
 * Generates accurate, data-driven sentiment insight text.
 * Checks negativePct first — avoids the bug where 0% negative
 * produced "notable areas for improvement" text.
 */
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

/* ═══════════════ TAB: SENTIMENT ═══════════════ */
function SentimentTab({ trust }) {
  if (!trust?.sentiment) return null;

  const { positive, neutral, negative } = trust.sentiment;

  const sentimentCards = [
    {
      label: 'Positive',
      value: positive,
      icon: '😊',
      color: 'emerald',
      bg: 'bg-[var(--color-emerald-bg)]',
      text: 'text-[var(--color-emerald)]',
      border: 'border-[var(--color-emerald-border)]',
      desc: 'Reviews expressing satisfaction, praise, or recommendation.',
    },
    {
      label: 'Neutral',
      value: neutral,
      icon: '😐',
      color: 'text-muted',
      bg: 'bg-white/[0.03]',
      text: 'text-[var(--color-text-secondary)]',
      border: 'border-[var(--color-border-default)]',
      desc: 'Reviews with mixed or balanced opinions, neither positive nor negative.',
    },
    {
      label: 'Negative',
      value: negative,
      icon: '😡',
      color: 'red',
      bg: 'bg-[var(--color-red-bg)]',
      text: 'text-[var(--color-red)]',
      border: 'border-[var(--color-red-border)]',
      desc: 'Reviews expressing dissatisfaction, complaints, or warnings.',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
          <Smile size={16} className="text-[var(--color-accent-indigo)]" />
          Sentiment Distribution
        </h3>
        <SentimentDonut sentiment={trust.sentiment} />
      </GlassCard>

      {/* Sentiment Cards */}
      <div className="space-y-4">
        {sentimentCards.map((s, i) => (
          <motion.div
            key={s.label}
            className={`p-4 rounded-[var(--radius-lg)] ${s.bg} border ${s.border}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
              </div>
              <span className={`text-xl font-bold font-mono ${s.text}`}>
                {s.value}%
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Insight Card */}
      <GlassCard hover={false} className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--color-accent-indigo)]" />
          Sentiment Insight
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {generateSentimentInsight(positive, neutral, negative)}
        </p>
      </GlassCard>
    </div>
  );
}

/* ═══════════════ TAB: FAKE DETECTION ═══════════════ */
function FakeDetectionTab({ fakeData, risk }) {
  if (!fakeData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fake Detection Bar */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--color-accent-indigo)]" />
          Fake vs Genuine Split
        </h3>
        <FakeDetectionBar fakeData={fakeData} className="mb-6" />

        {/* Risk Level Badge */}
        {risk && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-default)]">
            <span className="text-xs text-[var(--color-text-muted)]">Risk Assessment</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${risk.bg} ${risk.text} border ${risk.border}`}>
              {risk.label}
            </span>
          </div>
        )}
      </GlassCard>

      {/* ML Model Info */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Cpu size={16} className="text-[var(--color-accent-indigo)]" />
          ML Model Information
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Algorithm', value: 'Random Forest Classifier' },
            { label: 'Features', value: 'TF-IDF Vectorization' },
            { label: 'Training Data', value: 'Amazon Review Dataset' },
            { label: 'Detection Method', value: 'Text-based Classification' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border-default)] last:border-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <span className="text-xs text-[var(--color-text-muted)]">{item.label}</span>
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Stats Summary */}
      <GlassCard hover={false} className="lg:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-[var(--radius-md)] bg-white/[0.02]">
            <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)]">{fakeData.total_reviews}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Total Reviews</p>
          </div>
          <div className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--color-emerald-bg)]">
            <p className="text-2xl font-bold font-mono text-[var(--color-emerald)]">{fakeData.genuine_reviews}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Genuine</p>
          </div>
          <div className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--color-red-bg)]">
            <p className="text-2xl font-bold font-mono text-[var(--color-red)]">{fakeData.fake_reviews}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Fake</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════ TAB: REVIEWS ═══════════════ */
function ReviewsTab({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState title="No reviews" description="No reviews have been analyzed for this product yet." />;
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {reviews.map((review, index) => (
        <ReviewCard key={index} review={review} index={index} />
      ))}
    </div>
  );
}
