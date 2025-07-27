// src/components/Spinner.jsx
export default function Spinner({ size = 24 }) {
  return (
    <div className="animate-spin inline-block" style={{ width: size, height: size }}>
      <svg className="w-full h-full text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
    </div>
  );
}
