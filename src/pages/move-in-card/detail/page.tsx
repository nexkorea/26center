import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase, type MoveInCard, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function MoveInCardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [moveInCard, setMoveInCard] = useState<MoveInCard | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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

      // 사용자 프로필 확인
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isUserAdmin = userProfile?.role === 'admin';
      setIsAdmin(isUserAdmin);
      
      // 입주카드 로드 (권한 체크 포함)
      await loadMoveInCard(user.id, isUserAdmin);
    } catch (error) {
      console.error('Error checking user:', error);
      setError('사용자 인증에 실패했습니다.');
      setLoading(false);
    }
  };

  const loadMoveInCard = async (userId: string, isUserAdmin: boolean) => {
    try {
      console.log('Loading move-in card:', { id, userId, isUserAdmin });
      
      let query = supabase
        .from('move_in_cards')
        .select(`
          *,
          profiles(name, email, phone)
        `)
        .eq('id', id);

      // 관리자가 아니면 자신의 입주카드만 볼 수 있음
      if (!isUserAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();
      
      console.log('Query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'PGRST116') {
          throw new Error('입주카드를 찾을 수 없습니다.');
        }
        throw error;
      }
      
      if (!data) {
        throw new Error('입주카드를 찾을 수 없습니다.');
      }

      console.log('Move-in card loaded successfully:', data);
      setMoveInCard(data);
      setProfile(data.profiles as Profile);
    } catch (error: any) {
      console.error('Error loading move-in card:', error);
      setError(error.message || '입주카드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '반려됨';
      case 'pending':
      default:
        return '대기중';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">입주카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !moveInCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error || '입주카드를 찾을 수 없습니다.'}</p>
          <div className="text-sm text-gray-500 mb-6">
            <p>• 입주카드 ID: {id}</p>
            <p>• 권한이 없거나 입주카드가 존재하지 않을 수 있습니다.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <i className="ri-arrow-left-line"></i>
              <span>대시보드로 돌아가기</span>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              <i className="ri-refresh-line"></i>
              <span>새로고침</span>
            </button>
          </div>
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
              <span className="hidden sm:block text-gray-600 font-medium">입주카드 상세</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="hidden sm:inline">{isAdmin ? "관리자 페이지" : "대시보드"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 헤더 섹션 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{moveInCard.company_name}</h1>
                <p className="text-blue-100">{moveInCard.business_type}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(moveInCard.status)}`}>
                  <i className="ri-checkbox-circle-line mr-2"></i>
                  {getStatusText(moveInCard.status)}
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  신청일: {new Date(moveInCard.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 회사 정보 */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <i className="ri-building-line mr-3 text-blue-600"></i>
                  회사 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                    <p className="text-gray-900 font-medium">{moveInCard.company_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
                    <p className="text-gray-900">{moveInCard.business_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">직원 수</label>
                    <p className="text-gray-900">{moveInCard.employee_count}명</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">층수</label>
                    <p className="text-gray-900 font-medium">{moveInCard.floor_number}층</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">호수</label>
                    <p className="text-gray-900">{moveInCard.room_number}호</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">입주 예정일</label>
                    <p className="text-gray-900">{new Date(moveInCard.move_in_date).toLocaleDateString('ko-KR')}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
                    <p className="text-gray-900 font-medium">{moveInCard.contact_person}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                    <p className="text-gray-900">{moveInCard.contact_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <p className="text-gray-900">{moveInCard.contact_email}</p>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">주차 필요</label>
                    <p className="text-gray-900">
                      {moveInCard.parking_needed ? (
                        <span className="inline-flex items-center text-green-600">
                          <i className="ri-check-line mr-1"></i>
                          필요함
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-500">
                          <i className="ri-close-line mr-1"></i>
                          불필요
                        </span>
                      )}
                    </p>
                  </div>
                  {moveInCard.parking_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">주차 공간 수</label>
                      <p className="text-gray-900">{moveInCard.parking_count}개</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 특별 요청사항 */}
            {moveInCard.special_requests && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                  <i className="ri-message-3-line mr-3 text-blue-600"></i>
                  특별 요청사항
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-900 whitespace-pre-wrap">{moveInCard.special_requests}</p>
                </div>
              </div>
            )}

            {/* 관리자 메모 */}
            {moveInCard.admin_notes && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                  <i className="ri-admin-line mr-3 text-blue-600"></i>
                  관리자 메모
                </h2>
                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-gray-900 whitespace-pre-wrap">{moveInCard.admin_notes}</p>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center">
              <div className="flex space-x-4">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <i className="ri-arrow-left-line"></i>
                  <span>{isAdmin ? "관리자 페이지로" : "목록으로"}</span>
                </Link>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <i className="ri-printer-line"></i>
                  <span>인쇄</span>
                </button>
              </div>
              
              {/* 관리자 전용 액션 버튼 */}
              {isAdmin && moveInCard.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // 승인 로직 (모달 또는 직접 처리)
                      console.log('승인 처리:', moveInCard.id);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="ri-check-line"></i>
                    <span>승인</span>
                  </button>
                  <button
                    onClick={() => {
                      // 반려 로직 (모달 또는 직접 처리)
                      console.log('반려 처리:', moveInCard.id);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <i className="ri-close-line"></i>
                    <span>반려</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
