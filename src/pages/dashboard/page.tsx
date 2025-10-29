import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type MoveInCard, type Profile } from '../../lib/supabase';
import Logo26Building from '../../components/Logo26Building';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [moveInCards, setMoveInCards] = useState<MoveInCard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

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
      }

      // 입주카드 목록 가져오기
      const { data: cardsData } = await supabase
        .from('move_in_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cardsData) {
        setMoveInCards(cardsData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: '검토중', class: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '승인됨', class: 'bg-green-100 text-green-800' },
      rejected: { text: '반려됨', class: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  // 입주자 유형 텍스트 변환 함수
  const getTenantTypeText = (tenantType: string) => {
    switch (tenantType) {
      case 'owner': return '소유주';
      case 'tenant': return '임차인';
      case 'other': return '기타';
      default: return '미분류';
    }
  };

  // 입주자 유형 아이콘 변환 함수
  const getTenantTypeIcon = (tenantType: string) => {
    switch (tenantType) {
      case 'owner': return 'ri-home-4-line';
      case 'tenant': return 'ri-building-line';
      case 'other': return 'ri-question-line';
      default: return 'ri-question-line';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo26Building size={40} />
              </Link>
              <span className="ml-2 sm:ml-4 text-gray-600 text-sm sm:text-base">
                <span className="hidden sm:inline">입주자 대시보드</span>
                <span className="sm:hidden">대시보드</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden md:inline text-sm sm:text-base text-gray-700">
                안녕하세요, {profile?.name}님
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                title="로그아웃"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <i className="ri-logout-box-line sm:hidden text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 상단 액션 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">내 입주카드</h2>
            <div className="flex space-x-3">
              {moveInCards.length === 1 && moveInCards[0].status === 'pending' && (
                <Link
                  to={`/move-in-card/edit/${moveInCards[0].id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-2"></i>
                  수정하기
                </Link>
              )}
              {moveInCards.length === 0 && (
                <Link
                  to="/move-in-card/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  새 입주카드 작성
                </Link>
              )}
            </div>
          </div>

          {/* 입주카드 상세보기 */}
          {moveInCards.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <i className="ri-file-list-3-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">입주카드가 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 입주카드를 작성해보세요.</p>
              <Link
                to="/move-in-card/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                입주카드 작성하기
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {moveInCards.map((card) => (
                <div key={card.id} className="p-6">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{card.company_name}</h3>
                      <p className="text-gray-600 mt-1">{card.business_type}</p>
                    </div>
                    {getStatusBadge(card.status)}
                  </div>

                  {/* 입주 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">입주자 유형</label>
                      <div className="flex items-center space-x-2">
                        <i className={`${getTenantTypeIcon(card.tenant_type || 'tenant')} text-blue-600`}></i>
                        <span className="text-gray-900 font-medium">{getTenantTypeText(card.tenant_type || 'tenant')}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">입주 위치</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-building-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{card.floor_number}층 {card.room_number}호</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">입주일</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-calendar-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{new Date(card.move_in_date).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* 연락처 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-user-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{card.contact_person}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-phone-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{card.contact_phone}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-mail-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{card.contact_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* 직원 수 및 주차 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">직원 수</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-group-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">{card.employee_count}명</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">주차 정보</label>
                      <div className="flex items-center space-x-2">
                        <i className="ri-car-line text-blue-600"></i>
                        <span className="text-gray-900 font-medium">
                          {card.parking_needed ? `${card.parking_count}대` : '불필요'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 차량번호 정보 */}
                  {card.parking_needed && card.vehicle_numbers && card.vehicle_numbers.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">등록된 차량번호</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(card.vehicle_numbers || []).map((vehicleNumber, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {index + 1}번
                            </span>
                            <span className="text-gray-900 font-mono">{vehicleNumber}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 특별 요청사항 */}
                  {card.special_requests && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">특별 요청사항</label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{card.special_requests}</p>
                      </div>
                    </div>
                  )}

                  {/* 관리자 메모 */}
                  {card.admin_notes && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">관리자 메모</label>
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{card.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* 신청 정보 */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          <i className="ri-time-line mr-1"></i>
                          신청일: {new Date(card.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <span>
                          <i className="ri-refresh-line mr-1"></i>
                          수정일: {new Date(card.updated_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}