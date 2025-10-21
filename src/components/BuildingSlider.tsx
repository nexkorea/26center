import React, { useState, useEffect } from 'react';

// 로컬 이미지 import
import heroBuilding1 from '../assets/hero_building_1.jpeg';
import heroBuilding2 from '../assets/hero_building_2.jpeg';
import heroBuilding3 from '../assets/hero_building_3.jpeg';

interface BuildingSliderProps {
  className?: string;
}

const BuildingSlider: React.FC<BuildingSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 빌딩 이미지들 (로컬 이미지 사용)
  const buildingImages = [
    {
      url: heroBuilding1,
      alt: '26센터 건물 로비 - 현대적인 대형 건물의 넓은 로비 공간',
      title: '26센터 메인 로비'
    },
    {
      url: heroBuilding2,
      alt: '26센터 건물 내부 - 세련된 건축 디테일과 자연 채광',
      title: '26센터 내부 공간'
    },
    {
      url: heroBuilding3,
      alt: '26센터 건물 중앙홀 - 메자닌과 입구가 조화된 현대적 공간',
      title: '26센터 중앙홀'
    }
  ];

  // 이미지 프리로딩
  useEffect(() => {
    const loadImages = async () => {
      console.log('이미지 로딩 시작...');
      setIsLoading(true);
      
      const loadPromises = buildingImages.map((image, index) => {
        return new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`이미지 ${index + 1} 로드 완료:`, image.title);
            resolve(true);
          };
          img.onerror = (error) => {
            console.error(`이미지 ${index + 1} 로드 실패:`, image.title, error);
            resolve(false);
          };
          img.src = image.url;
        });
      });

      const results = await Promise.all(loadPromises);
      setLoadedImages(results);
      setIsLoading(false);
      console.log('모든 이미지 로딩 완료:', results);
    };

    loadImages();
  }, []);

  // 3초마다 자동 슬라이딩
  useEffect(() => {
    if (!isLoading && loadedImages.some(Boolean)) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % buildingImages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoading, loadedImages, buildingImages.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + buildingImages.length) % buildingImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % buildingImages.length);
  };

  const allImagesLoaded = loadedImages.length === buildingImages.length && loadedImages.every(Boolean);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden z-0 ${className}`}
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0
      }}
    >
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl font-medium">26센터 이미지 로딩 중...</p>
            <p className="text-sm opacity-75 mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {/* 슬라이드 컨테이너 */}
      <div className="relative w-full h-full">
        {buildingImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } ${!loadedImages[index] ? 'hidden' : ''}`}
          >
            {/* 이미지 */}
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover object-center"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  console.error('이미지 로드 실패:', image.title);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* 이미지 제목 오버레이 */}
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  {image.title}
                </h3>
                <p className="text-lg opacity-90 drop-shadow-md">
                  {image.alt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      {!isLoading && allImagesLoaded && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group"
            aria-label="이전 슬라이드"
          >
            <i className="ri-arrow-left-line text-2xl group-hover:scale-110 transition-transform"></i>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group"
            aria-label="다음 슬라이드"
          >
            <i className="ri-arrow-right-line text-2xl group-hover:scale-110 transition-transform"></i>
          </button>
        </>
      )}

      {/* 슬라이드 인디케이터 */}
      {!isLoading && allImagesLoaded && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {buildingImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${
                index === currentSlide
                  ? 'bg-white scale-125 shadow-xl'
                  : 'bg-white/60 hover:bg-white/80 hover:scale-110'
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 슬라이드 카운터 */}
      {!isLoading && allImagesLoaded && (
        <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentSlide + 1} / {buildingImages.length}
        </div>
      )}
    </div>
  );
};

export default BuildingSlider;