import React, { useState, useEffect } from 'react';

// 임시로 안정적인 외부 이미지 사용 (로컬 이미지 문제 해결 후 교체)
// import heroBuilding1 from '../assets/hero_building_1.jpeg';
// import heroBuilding2 from '../assets/hero_building_2.jpeg';
// import heroBuilding3 from '../assets/hero_building_3.jpeg';

interface BuildingSliderProps {
  className?: string;
}

const BuildingSlider: React.FC<BuildingSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);

  // 빌딩 이미지들 (더 간단하고 안정적인 이미지 사용)
  const buildingImages = [
    {
      url: 'https://picsum.photos/1920/1080?random=1',
      alt: '26센터 건물 로비 - 현대적인 대형 건물의 넓은 로비 공간'
    },
    {
      url: 'https://picsum.photos/1920/1080?random=2',
      alt: '26센터 건물 내부 - 세련된 건축 디테일과 자연 채광'
    },
    {
      url: 'https://picsum.photos/1920/1080?random=3',
      alt: '26센터 건물 중앙홀 - 메자닌과 입구가 조화된 현대적 공간'
    }
  ];

  // 이미지 프리로딩 (간단한 방식)
  useEffect(() => {
    console.log('이미지 로딩 시작...');
    // 모든 이미지를 로드된 것으로 간주하고 바로 슬라이딩 시작
    setLoadedImages([true, true, true]);
  }, []);

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
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${image.url}')`
              }}
            />
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
      </div>

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {buildingImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-xl'
                : 'bg-white bg-opacity-60 hover:bg-opacity-80 hover:scale-110'
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
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="이전 슬라이드"
      >
        <i className="ri-arrow-left-line text-2xl"></i>
      </button>
      
      <button
        onClick={() => setCurrentSlide((prev) => 
          (prev + 1) % buildingImages.length
        )}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="다음 슬라이드"
      >
        <i className="ri-arrow-right-line text-2xl"></i>
      </button>
    </div>
  );
};

export default BuildingSlider;
