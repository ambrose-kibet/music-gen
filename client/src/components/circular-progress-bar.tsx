const CircularProgress: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
}> = ({ percent, size = 40, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--muted-foreground, #e5e7eb)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--primary, #06b6d4)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
};

export default CircularProgress;
