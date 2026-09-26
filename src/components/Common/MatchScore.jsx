import React from 'react';
import './MatchScore.css';

const MatchScore = ({ score = 0, size = 'md', showLabel = false }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  const getColorClass = () => {
    if (normalizedScore >= 80) return 'match-high';
    if (normalizedScore >= 60) return 'match-medium';
    return 'match-low';
  };

  const getDimensions = () => {
    switch (size) {
      case 'sm': return { radius: 14, stroke: 3, size: 36 };
      case 'lg': return { radius: 32, stroke: 6, size: 80 };
      case 'md': 
      default: return { radius: 22, stroke: 4, size: 56 };
    }
  };

  const { radius, stroke, size: svgSize } = getDimensions();
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const center = svgSize / 2;

  return (
    <div className={`match-score-container match-score-${size}`}>
      <div className={`match-score ${getColorClass()}`} style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="match-score-svg"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={stroke}
            className="match-score-bg"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="match-score-progress"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="match-score-text">
          <span>{normalizedScore}</span>
          <span className="match-score-percent">%</span>
        </div>
      </div>
      {showLabel && <div className="match-score-label">Match</div>}
    </div>
  );
};

export default MatchScore;
