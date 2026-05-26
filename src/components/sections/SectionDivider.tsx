export function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex justify-center py-8 bg-white">
      <svg
        width="600"
        height="24"
        viewBox="0 0 600 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-[80%] text-saffron"
      >
        <line
          x1="0"
          y1="12"
          x2="250"
          y2="12"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <line
          x1="350"
          y1="12"
          x2="600"
          y2="12"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <g transform="translate(300 12)" className="text-indigo">
          <circle
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle r="2" fill="currentColor" fillOpacity="0.7" />
        </g>
        <g transform="translate(270 12)">
          <circle r="1.5" fill="currentColor" fillOpacity="0.4" />
        </g>
        <g transform="translate(330 12)">
          <circle r="1.5" fill="currentColor" fillOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}
