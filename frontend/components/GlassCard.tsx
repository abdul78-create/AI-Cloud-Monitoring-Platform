import { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<{ className?: string }>;

export const GlassCard = ({ className = "", children }: GlassCardProps) => {
  return <div className={`glass-card rounded-2xl p-5 ${className}`}>{children}</div>;
};
