import { useReducedMotion } from "framer-motion";

export const useAnimations = () => {
  const shouldReduceMotion = useReducedMotion();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: shouldReduceMotion ? 0 : 0.3 },
  };

  const slideIn = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.2 },
  };

  return {
    fadeIn,
    slideIn,
  };
};
