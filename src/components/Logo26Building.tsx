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
        style={{
          width: size,
          height: size,
          backgroundColor: '#1E3A8A',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(30, 58, 138, 0.3)'
        }}
      >
        {/* 건물 윤곽선 */}
        <svg 
          width={size * 0.7} 
          height={size * 0.7} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ color: 'white' }}
        >
          {/* 메인 건물 */}
          <rect x="6" y="8" width="12" height="14" fill="currentColor" rx="1"/>
          {/* 건물 지붕 */}
          <path d="M4 8 L12 4 L20 8 L20 9 L4 9 Z" fill="currentColor"/>
          {/* 창문들 */}
          <rect x="8" y="11" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="11" y="11" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="14" y="11" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="8" y="15" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="11" y="15" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="14" y="15" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="8" y="19" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="11" y="19" width="2" height="2" fill="white" rx="0.5"/>
          <rect x="14" y="19" width="2" height="2" fill="white" rx="0.5"/>
          {/* 입구 */}
          <rect x="10" y="20" width="4" height="2" fill="white" rx="1"/>
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
