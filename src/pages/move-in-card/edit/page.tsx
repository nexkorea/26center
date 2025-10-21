import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, type MoveInCard, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function EditMoveInCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    tenant_type: 'tenant' as 'owner' | 'tenant' | 'other', // 기본값: 임차인
    floor_number: '',
    room_number: '',
    move_in_date: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    employee_count: 0,
    parking_needed: false,
    parking_count: 0,
    vehicle_numbers: [] as string[], // 차량번호 배열
    special_requests: ''
  });

  useEffect(() => {
    if (id) {
      checkUserAndLoadCard();
    }
  }, [id]);

  const checkUserAndLoadCard = async () => {
    try {
      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // 사용자 프로필 확인
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(userProfile?.role === 'admin');

      // 관리자가 아니면 접근 거부
      if (userProfile?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      // 입주카드 데이터 로드
      await loadMoveInCard();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    }
  };

  const loadMoveInCard = async () => {
    try {
      const { data, error } = await supabase
        .from('move_in_cards')
        .select(`
          *,
          profiles(name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('입주카드를 찾을 수 없습니다.');

      setFormData({
        company_name: data.company_name || '',
        business_type: data.business_type || '',
        tenant_type: data.tenant_type || 'tenant', // 기본값 설정
        floor_number: data.floor_number || '',
        room_number: data.room_number || '',
        move_in_date: data.move_in_date || '',
        contact_person: data.contact_person || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        employee_count: data.employee_count || 0,
        parking_needed: data.parking_needed || false,
        parking_count: data.parking_count || 0,
        vehicle_numbers: data.vehicle_numbers || [], // 차량번호 배열 로드
        special_requests: data.special_requests || ''
      });
    } catch (error: any) {
      setError(error.message || '입주카드를 불러오는데 실패했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // 주차 공간이 필요하지 않으면 차량번호 배열 초기화
        ...(name === 'parking_needed' && !checked ? { vehicle_numbers: [] } : {})
      }));
    } else if (type === 'number') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        // 주차 대수가 변경되면 차량번호 배열 크기 조정
        ...(name === 'parking_count' ? {
          vehicle_numbers: prev.vehicle_numbers.slice(0, numValue).concat(
            Array(Math.max(0, numValue - prev.vehicle_numbers.length)).fill('')
          )
        } : {})
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * 차량번호 입력 처리
   */
  const handleVehicleNumberChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicle_numbers: prev.vehicle_numbers.map((num, i) => 
        i === index ? value : num
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // DB에 저장할 데이터 준비 (컬럼이 없을 경우를 대비한 fallback)
      const updateData = {
        company_name: formData.company_name,
        business_type: formData.business_type,
        tenant_type: formData.tenant_type || 'tenant', // fallback
        floor_number: formData.floor_number,
        room_number: formData.room_number,
        move_in_date: formData.move_in_date,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        employee_count: formData.employee_count || 0,
        parking_needed: formData.parking_needed || false,
        parking_count: formData.parking_needed ? (formData.parking_count || 0) : 0,
        vehicle_numbers: formData.vehicle_numbers || [], // fallback
        special_requests: formData.special_requests,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('move_in_cards')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      navigate('/admin');
    } catch (error: any) {
      setError(error.message || '입주카드 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.company_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">입주카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.company_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
            <span>관리자 페이지로 돌아가기</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center">
                <Logo26Building size={40} />
              </Link>
              <span className="hidden sm:block text-gray-400">|</span>
              <span className="hidden sm:block text-gray-600 font-medium">입주카드 수정</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="hidden sm:inline">관리자 페이지</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 헤더 섹션 */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">입주카드 수정</h1>
                <p className="text-yellow-100">{formData.company_name}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-600 text-white">
                  <i className="ri-edit-line mr-2"></i>
                  수정 모드
                </div>
              </div>
            </div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <i className="ri-error-warning-line text-red-500 mr-2"></i>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 회사 정보 */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="ri-building-line mr-3 text-blue-600"></i>
                  회사 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                      회사명 *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      id="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
                      업종 *
                    </label>
                    <select
                      name="business_type"
                      id="business_type"
                      required
                      value={formData.business_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">업종을 선택하세요</option>
                      <option value="IT/소프트웨어">IT/소프트웨어</option>
                      <option value="금융/보험">금융/보험</option>
                      <option value="제조업">제조업</option>
                      <option value="유통/물류">유통/물류</option>
                      <option value="서비스업">서비스업</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-2">
                      직원 수
                    </label>
                    <input
                      type="number"
                      name="employee_count"
                      id="employee_count"
                      min="0"
                      value={formData.employee_count}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 입주 정보 */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="ri-map-pin-line mr-3 text-blue-600"></i>
                  입주 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="floor_number" className="block text-sm font-medium text-gray-700 mb-2">
                      층수 *
                    </label>
                    <input
                      type="text"
                      name="floor_number"
                      id="floor_number"
                      required
                      value={formData.floor_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-2">
                      호수 *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      id="room_number"
                      required
                      value={formData.room_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="move_in_date" className="block text-sm font-medium text-gray-700 mb-2">
                      입주 예정일 *
                    </label>
                    <input
                      type="date"
                      name="move_in_date"
                      id="move_in_date"
                      required
                      value={formData.move_in_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 담당자 정보 */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="ri-user-line mr-3 text-blue-600"></i>
                  담당자 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                      담당자명 *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      id="contact_person"
                      required
                      value={formData.contact_person}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      id="contact_phone"
                      required
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      required
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 주차 정보 */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="ri-car-line mr-3 text-blue-600"></i>
                  주차 정보
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="parking_needed"
                      id="parking_needed"
                      checked={formData.parking_needed}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parking_needed" className="ml-2 block text-sm text-gray-700">
                      주차 공간이 필요합니다
                    </label>
                  </div>
                  {formData.parking_needed && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="parking_count" className="block text-sm font-medium text-gray-700 mb-2">
                          주차 공간 수
                        </label>
                        <input
                          type="number"
                          name="parking_count"
                          id="parking_count"
                          min="0"
                          value={formData.parking_count}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* 차량번호 입력 필드들 */}
                      {formData.parking_count > 0 && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            <i className="ri-car-2-line mr-2 text-blue-600"></i>
                            차량번호 입력
                          </label>
                          <div className="grid grid-cols-1 gap-3">
                            {Array.from({ length: formData.parking_count }, (_, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-600 w-8">
                                  {index + 1}번
                                </span>
                                <input
                                  type="text"
                                  value={formData.vehicle_numbers[index] || ''}
                                  onChange={(e) => handleVehicleNumberChange(index, e.target.value)}
                                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                  placeholder={`차량번호 ${index + 1} (예: 12가3456)`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            <i className="ri-information-line mr-1"></i>
                            차량번호는 한글, 숫자, 영문을 포함하여 입력해주세요 (예: 12가3456, 123가4567)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 특별 요청사항 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                <i className="ri-message-3-line mr-3 text-blue-600"></i>
                특별 요청사항
              </h2>
              <textarea
                name="special_requests"
                id="special_requests"
                rows={4}
                value={formData.special_requests}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="특별한 요청사항이 있으시면 입력해주세요..."
              />
            </div>

            {/* 액션 버튼 */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end space-x-4">
              <Link
                to="/admin"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <i className="ri-arrow-left-line"></i>
                <span>취소</span>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    <span>수정 중...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    <span>수정 완료</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
