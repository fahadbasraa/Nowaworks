import { motion } from "framer-motion";

export function PageHeader({ breadcrumb, title, subtitle, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-8 flex items-end justify-between gap-4"
    >
      <div>
        {breadcrumb && <div className="mb-1.5 text-xs text-text-3">{breadcrumb}</div>}
        <h1 className="font-serif italic text-3xl text-text">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-text-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
