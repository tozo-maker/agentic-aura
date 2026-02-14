import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const RevealOnScroll = ({ children, delay = 0, className }: RevealOnScrollProps) => (
  <motion.div
    custom={delay}
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-40px" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default RevealOnScroll;
