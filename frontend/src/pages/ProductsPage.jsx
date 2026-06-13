import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Filter,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  getProducts,
  getProductStats,
  getTrustScore,
  getFakeReviews,
} from '../services/api';
import API from '../services/api';
import ProductCard from '../components/product/ProductCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import FilterChips from '../components/ui/FilterChips';
import { SkeletonGrid } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import GlassCard from '../components/ui/GlassCard';

const FILTERS = [
  { id: 'all', label: 'All Products', icon: '📦' },
  { id: 'high', label: 'High Trust', icon: '✅' },
  { id: 'flagged', label: 'Flagged', icon: '⚠️' },
  { id: 'unverified', label: 'Unverified', icon: '❓' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [enrichedData, setEnrichedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [heroStats, setHeroStats] = useState({ productCount: 0, reviewCount: 0 });

  // Fetch products and hero stats
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, productCountRes, reviewCountRes] = await Promise.all([
        getProducts(),
        API.get('/products/count').then(r => r.data).catch(() => ({ product_count: 0 })),
        API.get('/reviews/count').then(r => r.data).catch(() => ({ review_count: 0 })),
      ]);
      setProducts(productsData);
      setHeroStats({
        productCount: productCountRes.product_count || productsData.length,
        reviewCount: reviewCountRes.review_count || 0,
      });

      // Enrich each product with stats, trust, and fake data in parallel
      const enrichPromises = productsData.map(async (product) => {
        try {
          const [stats, trust, fake] = await Promise.all([
            getProductStats(product.id),
            getTrustScore(product.id),
            getFakeReviews(product.id),
          ]);
          return { id: product.id, stats, trust, fake };
        } catch {
          return { id: product.id, stats: null, trust: null, fake: null };
        }
      });

      const enrichResults = await Promise.allSettled(enrichPromises);
      const enrichMap = {};
      enrichResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { id, ...data } = result.value;
          enrichMap[id] = data;
        }
      });
      setEnrichedData(enrichMap);
    } catch (err) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute average trust score
  const avgTrustScore = (() => {
    const scores = Object.values(enrichedData)
      .filter(d => d.trust?.trust_score != null)
      .map(d => d.trust.trust_score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  })();

  // Filter and search
  const filteredProducts = products
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = String(p.id).includes(q);
        const matchesAsin = p.amazon_product_id?.toLowerCase().includes(q);
        return matchesId || matchesAsin;
      }
      return true;
    })
    .filter((p) => {
      const data = enrichedData[p.id];
      if (!data?.trust) return activeFilter === 'all' || activeFilter === 'unverified';

      switch (activeFilter) {
        case 'high':
          return data.trust.trust_score >= 75;
        case 'flagged':
          return data.trust.trust_score < 50;
        case 'unverified':
          return !data.trust;
        default:
          return true;
      }
    });

  // Build filter chips with counts
  const filtersWithCounts = FILTERS.map((f) => {
    let count;
    switch (f.id) {
      case 'all':
        count = products.length;
        break;
      case 'high':
        count = Object.values(enrichedData).filter(d => d.trust?.trust_score >= 75).length;
        break;
      case 'flagged':
        count = Object.values(enrichedData).filter(d => d.trust?.trust_score < 50).length;
        break;
      case 'unverified':
        count = products.length - Object.values(enrichedData).filter(d => d.trust).length;
        break;
      default:
        count = 0;
    }
    return { ...f, count };
  });

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard hover={false} className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent-indigo)]" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent-indigo-bg)] flex items-center justify-center">
              <Package size={24} className="text-[var(--color-accent-indigo)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Total Products</p>
              <AnimatedCounter
                value={heroStats.productCount}
                className="text-2xl font-bold text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-emerald)]" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-emerald-bg)] flex items-center justify-center">
              <MessageSquare size={24} className="text-[var(--color-emerald)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Reviews Analyzed</p>
              <AnimatedCounter
                value={heroStats.reviewCount}
                className="text-2xl font-bold text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-amber)]" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-amber-bg)] flex items-center justify-center">
              <ShieldCheck size={24} className="text-[var(--color-amber)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Avg Trust Score</p>
              <AnimatedCounter
                value={avgTrustScore}
                suffix="%"
                className="text-2xl font-bold text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by Product ID or ASIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] bg-white/[0.03] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-accent)] focus:bg-white/[0.05] transition-all"
            id="product-search"
            aria-label="Search products"
          />
        </div>
        <FilterChips
          filters={filtersWithCounts}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </motion.div>

      {/* Product Grid */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={searchQuery ? `No products match "${searchQuery}". Try a different search.` : 'No products match the selected filter.'}
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setActiveFilter('all'); }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              enrichedData={enrichedData[product.id]}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
