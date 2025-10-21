import React, { useState, useEffect } from 'react';

interface BuildingSliderProps {
  className?: string;
}

const BuildingSlider: React.FC<BuildingSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 빌딩 이미지들
  const images = [
    'https://picsum.photos/1920/1080?random=1',
    'https://picsum.photos/1920/1080?random=2',
    'https://picsum.photos/1920/1080?random=3'
  ];

  // 3초마다 자동 슬라이딩
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 슬라이드 컨테이너 */}
      <div className="relative w-full h-full">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={imageUrl}
              alt={`26센터 건물 이미지 ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('이미지 로드 실패:', imageUrl);
                // 이미지 로드 실패 시 기본 배경색 표시
                (e.target as HTMLImageElement).style.backgroundColor = '#1e3a8a';
              }}
            />
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
      </div>

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-60 hover:bg-opacity-80'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* 좌우 네비게이션 버튼 */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="이전 슬라이드"
      >
        <i className="ri-arrow-left-line text-2xl"></i>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="다음 슬라이드"
      >
        <i className="ri-arrow-right-line text-2xl"></i>
      </button>
    </div>
  );
};

export default BuildingSlider;