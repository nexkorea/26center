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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo26Building size={40} />
              </Link>
              <span className="ml-4 text-gray-600">입주자 대시보드</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {profile?.name}님</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                로그아웃
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
              {moveInCards.length === 1 && (
                <Link
                  to={`/move-in-card/detail/${moveInCards[0].id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-eye-line mr-2"></i>
                  상세보기
                </Link>
              )}
              <Link
                to="/move-in-card/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                새 입주카드 작성
              </Link>
            </div>
          </div>

          {/* 입주카드 목록 */}
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
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {moveInCards.map((card) => (
                  <li key={card.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-blue-600 truncate">
                              {card.company_name}
                            </p>
                            {getStatusBadge(card.status)}
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <i className="ri-building-line mr-1"></i>
                                {card.floor_number}층 {card.room_number}호
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <i className="ri-calendar-line mr-1"></i>
                                입주일: {new Date(card.move_in_date).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <i className="ri-time-line mr-1"></i>
                              신청일: {new Date(card.created_at).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                          {card.admin_notes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>관리자 메모:</strong> {card.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Link
                            to={`/move-in-card/${card.id}`}
                            className="text-blue-600 hover:text-blue-500 cursor-pointer"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}