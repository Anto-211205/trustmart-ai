import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

export default function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  const displayRef = useRef(null);

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const controls = animate(motionVal, numValue, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return () => controls.stop();
  }, [value, duration, motionVal]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${v}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [rounded, prefix, suffix]);

  return (
    <motion.span
      ref={displayRef}
      className={`font-mono tabular-nums ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
