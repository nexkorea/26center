import React, { useState, useEffect } from 'react';

interface BuildingSliderProps {
  className?: string;
}

const BuildingSlider: React.FC<BuildingSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);

  // 빌딩 이미지들 (Unsplash의 안정적인 이미지 사용)
  const buildingImages = [
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Modern Office Building 1'
    },
    {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      alt: 'Luxury Office Building'
    },
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Business Complex'
    }
  ];

  // 이미지 프리로딩
  useEffect(() => {
    const loadImages = async () => {
      const loadPromises = buildingImages.map((image, index) => {
        return new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = image.url;
        });
      });

      const results = await Promise.all(loadPromises);
      setLoadedImages(results);
    };

    loadImages();
  }, [buildingImages]);

  // 3초마다 자동 슬라이딩
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % buildingImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [buildingImages.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 슬라이드 컨테이너 */}
      <div className="relative w-full h-full">
        {buildingImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {loadedImages[index] ? (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${image.url}')`
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                <div className="text-white text-center">
                  <i className="ri-building-line text-6xl mb-4"></i>
                  <p className="text-lg">빌딩 이미지 로딩 중...</p>
                </div>
              </div>
            )}
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
      </div>

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {buildingImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-110'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>

      {/* 좌우 네비게이션 버튼 */}
      <button
        onClick={() => setCurrentSlide((prev) => 
          prev === 0 ? buildingImages.length - 1 : prev - 1
        )}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-200"
        aria-label="이전 슬라이드"
      >
        <i className="ri-arrow-left-line text-xl"></i>
      </button>
      
      <button
        onClick={() => setCurrentSlide((prev) => 
          (prev + 1) % buildingImages.length
        )}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-200"
        aria-label="다음 슬라이드"
      >
        <i className="ri-arrow-right-line text-xl"></i>
      </button>
    </div>
  );
};

export default BuildingSlider;
