import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function NewMoveInCard() {
  // 사용자 정보 상태
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 현재 단계 (1-4)
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    floor_number: '',
    room_number: '',
    move_in_date: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    employee_count: 0,
    parking_needed: false,
    parking_count: 0,
    special_requests: ''
  });

  // 컴포넌트 마운트 시 사용자 정보 확인
  useEffect(() => {
    checkUser();
  }, []);


  /**
   * 사용자 인증 확인 및 프로필 정보 로드
   */
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        // 담당자 정보를 프로필 정보로 자동 채우기 (비어있으면 Auth metadata로 보완)
        const metaName = (user.user_metadata?.name as string | undefined) || profileData.name || user.email?.split('@')[0] || '사용자';
        const metaPhone = (user.user_metadata?.phone as string | undefined) || profileData.phone || '';
        const metaEmail = profileData.email || user.email || '';

        console.log('Profile data loaded:', { metaName, metaPhone, metaEmail, userEmail: user.email });
        setFormData(prev => ({
          ...prev,
          contact_person: metaName,
          contact_phone: metaPhone,
          contact_email: metaEmail
        }));
      } else {
        // 프로필이 없는 경우 Auth 정보로만 채우기
        const metaName = (user.user_metadata?.name as string | undefined) || user.email?.split('@')[0] || '사용자';
        const metaPhone = (user.user_metadata?.phone as string | undefined) || '';
        const metaEmail = user.email || '';

        console.log('No profile, using auth data:', { metaName, metaPhone, metaEmail, userEmail: user.email });
        setFormData(prev => ({
          ...prev,
          contact_person: metaName,
          contact_phone: metaPhone,
          contact_email: metaEmail
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * 폼 제출 처리
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called, currentStep:', currentStep);
    setLoading(true);
    setError('');

    try {
      // 프로필 정보 동기화: 담당자 입력값으로 profiles 테이블을 최신화 (없으면 생성, 있으면 업데이트)
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.contact_person,
          email: formData.contact_email,
          phone: formData.contact_phone,
          role: profile?.role ?? 'user',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      const { error } = await supabase
        .from('move_in_cards')
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      // 성공 시 대시보드로 이동
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || '입주카드 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 입력 필드 변경 처리
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  /**
   * 다음 단계로 이동
   */
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * 이전 단계로 이동
   */
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * 현재 단계의 폼 유효성 검사
   */
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.company_name && formData.business_type);
      case 2:
        return !!(formData.floor_number && formData.room_number && formData.move_in_date);
      case 3:
        return !!(formData.contact_person && formData.contact_phone && formData.contact_email);
      case 4:
        return true; // 추가 정보는 선택사항
      default:
        return false;
    }
  };

  // 단계별 제목 및 설명
  const steps = [
    { number: 1, title: '회사 정보', description: '기본적인 회사 정보를 입력해주세요', icon: 'ri-building-line' },
    { number: 2, title: '입주 정보', description: '입주 위치와 날짜를 입력해주세요', icon: 'ri-map-pin-line' },
    { number: 3, title: '담당자 정보', description: '담당자 연락처를 입력해주세요', icon: 'ri-user-line' },
    { number: 4, title: '추가 정보', description: '기타 필요한 정보를 입력해주세요', icon: 'ri-information-line' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center">
                <Logo26Building size={40} />
              </Link>
              <span className="hidden sm:block text-gray-400">|</span>
              <span className="hidden sm:block text-gray-600 font-medium">입주카드 작성</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="hidden sm:inline">대시보드</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                <i className="ri-logout-box-line sm:mr-2"></i>
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 진행 표시 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* 단계 아이콘 */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 mb-2
                    ${currentStep === step.number 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                      : currentStep > step.number
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      <i className={step.icon}></i>
                    )}
                  </div>
                  {/* 단계 제목 (데스크톱에만 표시) */}
                  <div className="hidden md:block text-center">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {/* 연결선 */}
                {index < steps.length - 1 && (
                  <div className={`
                    h-1 flex-1 mx-2 transition-all duration-300 rounded-full
                    ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          {/* 현재 단계 설명 */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm animate-shake">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-2xl mr-3"></i>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* 폼 카드 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* 단계 1: 회사 정보 */}
            {currentStep === 1 && (
              <div className="p-8 animate-fadeIn">
                <div className="space-y-6">
                  {/* 회사명 */}
                  <div className="relative">
                    <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-building-4-line mr-2 text-blue-600"></i>
                      회사명 *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      id="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="예: (주)테크컴퍼니"
                    />
                  </div>

                  {/* 업종 */}
                  <div className="relative">
                    <label htmlFor="business_type" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-briefcase-line mr-2 text-blue-600"></i>
                      업종 *
                    </label>
                    <select
                      name="business_type"
                      id="business_type"
                      required
                      value={formData.business_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    >
                      <option value="">업종을 선택하세요</option>
                      <option value="IT/소프트웨어">IT/소프트웨어</option>
                      <option value="제조업">제조업</option>
                      <option value="서비스업">서비스업</option>
                      <option value="금융업">금융업</option>
                      <option value="유통업">유통업</option>
                      <option value="교육업">교육업</option>
                      <option value="의료업">의료업</option>
                      <option value="건설업">건설업</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  {/* 기타 업종 입력 */}
                  {formData.business_type === '기타' && (
                    <div className="relative animate-fadeIn">
                      <label htmlFor="business_type_other" className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="ri-edit-line mr-2 text-blue-600"></i>
                        상세 업종
                      </label>
                      <input
                        type="text"
                        name="business_type"
                        id="business_type_other"
                        value={formData.business_type === '기타' ? '' : formData.business_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="업종을 직접 입력해주세요"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 단계 2: 입주 정보 */}
            {currentStep === 2 && (
              <div className="p-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 층수 */}
                  <div className="relative">
                    <label htmlFor="floor_number" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-building-2-line mr-2 text-blue-600"></i>
                      층수 *
                    </label>
                    <input
                      type="text"
                      name="floor_number"
                      id="floor_number"
                      required
                      value={formData.floor_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="예: 5층"
                    />
                  </div>

                  {/* 호수 */}
                  <div className="relative">
                    <label htmlFor="room_number" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-door-line mr-2 text-blue-600"></i>
                      호수 *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      id="room_number"
                      required
                      value={formData.room_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="예: 501호"
                    />
                  </div>

                  {/* 입주 예정일 */}
                  <div className="relative md:col-span-2">
                    <label htmlFor="move_in_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-calendar-check-line mr-2 text-blue-600"></i>
                      입주 예정일 *
                    </label>
                    <input
                      type="date"
                      name="move_in_date"
                      id="move_in_date"
                      required
                      value={formData.move_in_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 단계 3: 담당자 정보 */}
            {currentStep === 3 && (
              <div className="p-8 animate-fadeIn">
                <div className="space-y-6">
                  {/* 담당자명 */}
                  <div className="relative">
                    <label htmlFor="contact_person" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-user-line mr-2 text-blue-600"></i>
                      담당자명 *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      id="contact_person"
                      required
                      value={formData.contact_person}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="담당자 이름"
                    />
                  </div>

                  {/* 연락처 */}
                  <div className="relative">
                    <label htmlFor="contact_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-phone-line mr-2 text-blue-600"></i>
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      id="contact_phone"
                      required
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="010-0000-0000"
                    />
                  </div>

                  {/* 이메일 */}
                  <div className="relative">
                    <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-mail-line mr-2 text-blue-600"></i>
                      이메일 *
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      required
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 단계 4: 추가 정보 */}
            {currentStep === 4 && (
              <div className="p-8 animate-fadeIn">
                <div className="space-y-6">
                  {/* 직원 수 */}
                  <div className="relative">
                    <label htmlFor="employee_count" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-group-line mr-2 text-blue-600"></i>
                      직원 수
                    </label>
                    <input
                      type="number"
                      name="employee_count"
                      id="employee_count"
                      min="0"
                      value={formData.employee_count}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="0"
                    />
                  </div>

                  {/* 주차 공간 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
                    <div className="flex items-start">
                      <input
                        id="parking_needed"
                        name="parking_needed"
                        type="checkbox"
                        checked={formData.parking_needed}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-1"
                      />
                      <label htmlFor="parking_needed" className="ml-3 cursor-pointer flex-1">
                        <span className="text-sm font-semibold text-gray-900 flex items-center">
                          <i className="ri-parking-box-line mr-2 text-blue-600 text-lg"></i>
                          주차 공간이 필요합니다
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          주차 공간이 필요한 경우 체크해주세요
                        </p>
                      </label>
                    </div>
                    
                    {formData.parking_needed && (
                      <div className="mt-4 animate-fadeIn">
                        <label htmlFor="parking_count" className="block text-sm font-semibold text-gray-700 mb-2">
                          <i className="ri-car-line mr-2 text-blue-600"></i>
                          필요한 주차 대수 *
                        </label>
                        <input
                          type="number"
                          name="parking_count"
                          id="parking_count"
                          min="1"
                          required={formData.parking_needed}
                          value={formData.parking_count}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                          placeholder="주차 대수를 입력하세요"
                        />
                      </div>
                    )}
                  </div>

                  {/* 특별 요청사항 */}
                  <div className="relative">
                    <label htmlFor="special_requests" className="block text-sm font-semibold text-gray-700 mb-2">
                      <i className="ri-message-3-line mr-2 text-blue-600"></i>
                      특별 요청사항
                    </label>
                    <textarea
                      name="special_requests"
                      id="special_requests"
                      rows={5}
                      value={formData.special_requests}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="추가로 요청하실 사항이 있으시면 작성해주세요&#10;예: 사무기기 설치, 인터넷 회선 등"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        최대 500자까지 입력 가능합니다
                      </p>
                      <p className={`text-sm font-medium ${formData.special_requests.length > 450 ? 'text-red-600' : 'text-gray-600'}`}>
                        {formData.special_requests.length}/500
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 네비게이션 버튼 */}
            <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
              {/* 이전 버튼 */}
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all
                  ${currentStep === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
                  }
                `}
              >
                <i className="ri-arrow-left-line"></i>
                <span>이전</span>
              </button>

              {/* 진행 상황 */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{currentStep}</span>
                <span>/</span>
                <span>{steps.length}</span>
              </div>

              {/* 다음/제출 버튼 */}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all
                    ${isStepValid()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <span>다음</span>
                  <i className="ri-arrow-right-line"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    console.log('Submit button clicked, currentStep:', currentStep);
                    handleSubmit(e);
                  }}
                  disabled={loading || !isStepValid()}
                  className={`
                    flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all
                    ${loading || !isStepValid()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>제출 중...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill"></i>
                      <span>입주카드 제출</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 도움말 카드 */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
              <i className="ri-lightbulb-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">도움말</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-blue-600 mr-2 mt-0.5"></i>
                  <span>모든 필수 항목(*)은 반드시 입력해야 합니다</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-blue-600 mr-2 mt-0.5"></i>
                  <span>제출 후 관리자 승인이 완료되면 이메일로 알려드립니다</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-fill text-blue-600 mr-2 mt-0.5"></i>
                  <span>문의사항은 관리자에게 연락해주세요</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
