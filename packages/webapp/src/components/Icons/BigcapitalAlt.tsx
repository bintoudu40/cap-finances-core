interface BigcapitalAltProps extends React.SVGProps<SVGSVGElement> {}

export function BigcapitalAlt(props: BigcapitalAltProps) {
  return (
    <svg
      data-icon="cap-finances-alt"
      width="180"
      height="36"
      viewBox="0 0 360 72"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <desc>Cap Finances</desc>
      {/* Icon mark: upward trend */}
      <polyline
        points="4,54 22,38 34,46 52,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "Cap Finances" text */}
      <text
        x="66"
        y="52"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="36"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        Cap Finances
      </text>
    </svg>
  );
}
