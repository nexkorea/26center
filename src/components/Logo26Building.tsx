import React from 'react';

interface Logo26BuildingProps {
  size?: number;
  className?: string;
}

const Logo26Building: React.FC<Logo26BuildingProps> = ({ 
  size = 40, 
  className = ''
}) => {
  // 건물 모양 아이콘 + 26센터 텍스트
  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* 건물 모양 아이콘 */}
      <div 
        className="logo-icon"
        style={{
          width: size,
          height: size,
          backgroundColor: '#1E3A8A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 3px 12px rgba(30, 58, 138, 0.25)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
      >
        {/* 건물 아이콘 SVG */}
        <svg 
          width={size * 0.75} 
          height={size * 0.75} 
          viewBox="0 0 32 32" 
          fill="none"
          className="building-icon"
        >
          {/* 건물 기반 */}
          <rect x="4" y="12" width="24" height="16" fill="white" rx="2"/>
          {/* 건물 지붕 */}
          <path d="M2 12 L16 6 L30 12 L30 14 L2 14 Z" fill="white"/>
          {/* 건물 외곽선 */}
          <rect x="4" y="12" width="24" height="16" fill="none" stroke="white" strokeWidth="1.5" rx="2"/>
          <path d="M2 12 L16 6 L30 12 L30 14 L2 14 Z" fill="none" stroke="white" strokeWidth="1.5"/>
          
          {/* 창문들 - 1층 */}
          <rect x="7" y="15" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="12" y="15" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="17" y="15" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="22" y="15" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          
          {/* 창문들 - 2층 */}
          <rect x="7" y="20" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="12" y="20" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="17" y="20" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="22" y="20" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          
          {/* 창문들 - 3층 */}
          <rect x="7" y="25" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="12" y="25" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="17" y="25" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          <rect x="22" y="25" width="3" height="3" fill="#1E3A8A" rx="0.5"/>
          
          {/* 입구 */}
          <rect x="13" y="26" width="6" height="2" fill="#1E3A8A" rx="1"/>
          
          {/* 건물 번호 "26" */}
          <text x="16" y="10" textAnchor="middle" fill="#1E3A8A" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">26</text>
        </svg>
      </div>
      
      {/* 26센터 텍스트 */}
      <h1 
        className="logo-text"
        style={{
          fontSize: `${Math.max(size * 0.6, 20)}px`,
          color: '#1E3A8A',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}
      >
        26센터
      </h1>
    </div>
  );
};

export default Logo26Building;
