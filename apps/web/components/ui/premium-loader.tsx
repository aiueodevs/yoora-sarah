export function PremiumLoader({ className = "" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin="0s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.8;1.1;0.8" dur="1.5s" begin="0s" repeatCount="indefinite" additive="sum" />
        <animateTransform attributeName="transform" type="translate" values="2.4 2.4; -1.2 -1.2; 2.4 2.4" dur="1.5s" begin="0s" repeatCount="indefinite" additive="sum" />
      </path>
      <circle cx="18" cy="5" r="1.5" fill="currentColor">
        <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1.2;0.5" dur="1.5s" begin="0.3s" repeatCount="indefinite" additive="sum" />
        <animateTransform attributeName="transform" type="translate" values="9 2.5; -3.6 -1; 9 2.5" dur="1.5s" begin="0.3s" repeatCount="indefinite" additive="sum" />
      </circle>
      <circle cx="6" cy="18" r="2" fill="currentColor">
        <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1;0.5" dur="1.5s" begin="0.6s" repeatCount="indefinite" additive="sum" />
        <animateTransform attributeName="transform" type="translate" values="3 9; -3 -9; 3 9" dur="1.5s" begin="0.6s" repeatCount="indefinite" additive="sum" />
      </circle>
    </svg>
  );
}
