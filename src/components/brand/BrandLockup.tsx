export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-lockup ${className}`} translate="no">
      <span aria-hidden="true" className="product-brand-mark">
        <span>1</span>
        <i />
      </span>
      <span className="brand-wordmark">One Step Wrong</span>
    </span>
  );
}
