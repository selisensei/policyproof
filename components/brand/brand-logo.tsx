/* eslint-disable @next/next/no-img-element -- Approved local SVG artwork must retain its original vectors and proportions. */

type BrandLogoProps = {
  className?: string;
  decorative?: boolean;
  variant?: "horizontal" | "mark" | "responsive";
};

export function BrandLogo({ className = "", decorative = false, variant = "horizontal" }: BrandLogoProps) {
  const alt = decorative ? "" : "PolicyProof";
  const classes = ["brand-logo", `brand-logo--${variant}`, className].filter(Boolean).join(" ");

  if (variant === "responsive") {
    return (
      <picture className={`brand-logo-picture ${className}`.trim()}>
        <source media="(max-width: 759px)" srcSet="/brand/policyproof-mark-color.svg" />
        <img
          alt={alt}
          className="brand-logo brand-logo--responsive"
          height="340"
          src="/brand/policyproof-logo-horizontal-color.svg"
          width="1320"
        />
      </picture>
    );
  }

  const isMark = variant === "mark";
  return (
    <img
      alt={alt}
      className={classes}
      height={isMark ? 512 : 340}
      src={isMark ? "/brand/policyproof-mark-color.svg" : "/brand/policyproof-logo-horizontal-color.svg"}
      width={isMark ? 512 : 1320}
    />
  );
}
