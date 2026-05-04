import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Custom scroll animation hook
 * Returns { ref, isInView } + pre-built motion props
 */
export function useScrollReveal({ once = true, margin = '-60px', delay = 0 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  const variants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay,
      },
    },
  };

  return {
    ref,
    isInView,
    motionProps: {
      ref,
      initial: 'hidden',
      animate: isInView ? 'visible' : 'hidden',
      variants,
    },
  };
}

/**
 * Staggered children animation — apply to parent container
 */
export function useStaggerReveal({ once = true, margin = '-40px', stagger = 0.06 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        type: 'spring',
        damping: 22,
        stiffness: 180,
      },
    },
  };

  return {
    ref,
    isInView,
    containerProps: {
      ref,
      initial: 'hidden',
      animate: isInView ? 'visible' : 'hidden',
      variants: containerVariants,
    },
    itemVariants,
  };
}

/**
 * Slide-in from side animation
 */
export function useSlideIn({ direction = 'left', once = true, margin = '-40px', delay = 0 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });

  const xOffset = direction === 'left' ? -40 : direction === 'right' ? 40 : 0;
  const yOffset = direction === 'up' ? 40 : direction === 'down' ? -40 : 0;

  const variants = {
    hidden: { opacity: 0, x: xOffset, y: yOffset },
    visible: {
      opacity: 1, x: 0, y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 150,
        delay,
      },
    },
  };

  return {
    ref,
    isInView,
    motionProps: {
      ref,
      initial: 'hidden',
      animate: isInView ? 'visible' : 'hidden',
      variants,
    },
  };
}
