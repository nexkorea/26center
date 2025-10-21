import React, { useState, useEffect } from 'react';

interface BuildingSliderProps {
  className?: string;
}

const BuildingSlider: React.FC<BuildingSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 빌딩 이미지들
  const buildingImages = [
    {
      url: 'https://readdy.ai/api/search-image?query=Modern%20skyscraper%20building%20with%20glass%20facade%2C%20contemporary%20architecture%2C%20blue%20sky%20background%2C%20professional%20office%20building%2C%20clean%20minimalist%20design%2C%20bright%20natural%20lighting%2C%20urban%20cityscape%2C%20high-rise%20building&width=1200&height=600&seq=hero-building-1&orientation=landscape',
      alt: 'Modern Office Building 1'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Luxury%20office%20building%20entrance%20with%20marble%20facade%2C%20elegant%20architecture%2C%20golden%20hour%20lighting%2C%20professional%20business%20environment%2C%20glass%20windows%2C%20modern%20design%2C%20corporate%20headquarters%2C%20prestigious%20building&width=1200&height=600&seq=hero-building-2&orientation=landscape',
      alt: 'Luxury Office Building'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Contemporary%20business%20complex%20with%20multiple%20buildings%2C%20modern%20architecture%2C%20glass%20and%20steel%20construction%2C%20urban%20skyline%2C%20professional%20environment%2C%20clean%20lines%2C%20sophisticated%20design%2C%20corporate%20campus&width=1200&height=600&seq=hero-building-3&orientation=landscape',
      alt: 'Business Complex'
    }
  ];

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
