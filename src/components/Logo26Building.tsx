import React from 'react';
import center26Logo from '../assets/center26.png';

interface Logo26BuildingProps {
  size?: number;
  className?: string;
}

const Logo26Building: React.FC<Logo26BuildingProps> = ({ 
  size = 40, 
  className = ''
}) => {
  // PNG 로고 + 특이한 폰트 텍스트
  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* 로고 이미지 */}
      <div 
        style={{
          width: size,
          height: size,
          backgroundColor: 'white',
          background: 'white',
          borderRadius: '4px',
          display: 'inline-block',
          overflow: 'hidden',
          boxShadow: 'none',
          filter: 'none',
          position: 'relative'
        }}
      >
        {/* 흰색 배경 레이어 */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            background: 'white',
            zIndex: 1
          }}
        />
        {/* 로고 이미지 */}
        <img 
          src={center26Logo} 
          alt="26빌딩 로고" 
          width={size} 
          height={size} 
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'block',
            backgroundColor: 'white',
            background: 'white',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            margin: 0,
            padding: 0,
            objectFit: 'contain',
            filter: 'none',
            mixBlendMode: 'normal'
          }}
        />
      </div>
      
      {/* 특이한 폰트로 26빌딩 텍스트 */}
      <h1 
        className="logo-text"
        style={{
          fontSize: `${Math.max(size * 0.6, 20)}px`,
          color: '#1E3A8A'
        }}
      >
        26빌딩
      </h1>
    </div>
  );
};

export default Logo26Building;
