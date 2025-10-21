import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type MoveInCard, type Profile } from '../../lib/supabase';
import AdminNotesModal from '../../components/AdminNotesModal';
import Logo26Building from '../../components/Logo26Building';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [moveInCards, setMoveInCards] = useState<MoveInCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<MoveInCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [error, setError] = useState('');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MoveInCard | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<MoveInCard | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  // 검색어와 필터에 따른 카드 필터링
  useEffect(() => {
    let filtered = moveInCards;

    // 상태 필터 적용
    if (filter !== 'all') {
      filtered = filtered.filter(card => card.status === filter);
    }

    // 일반 검색어 필터 적용
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.company_name?.toLowerCase().includes(searchLower) ||
        card.contact_person?.toLowerCase().includes(searchLower) ||
        card.contact_email?.toLowerCase().includes(searchLower) ||
        card.contact_phone?.toLowerCase().includes(searchLower) ||
        card.business_type?.toLowerCase().includes(searchLower) ||
        card.floor_number?.toLowerCase().includes(searchLower) ||
        card.room_number?.toLowerCase().includes(searchLower) ||
        card.profiles?.name?.toLowerCase().includes(searchLower) ||
        card.profiles?.email?.toLowerCase().includes(searchLower)
      );
    }

    // 호수 검색 필터 적용
    if (roomSearch.trim()) {
      const roomLower = roomSearch.toLowerCase();
      filtered = filtered.filter(card => 
        card.room_number?.toLowerCase().includes(roomLower) ||
        card.floor_number?.toLowerCase().includes(roomLower)
      );
    }

    setFilteredCards(filtered);
  }, [moveInCards, filter, searchTerm, roomSearch]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // 프로필 정보 확인 (관리자 권한 체크)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData || profileData.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setProfile(profileData);
      await loadMoveInCards();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoveInCards = async () => {
    try {
      console.log('Loading move-in cards...');
      const { data, error } = await supabase
        .from('move_in_cards')
        .select(`
          *,
          profiles(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      console.log('Query result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        setError('입주카드를 불러오는데 실패했습니다: ' + error.message);
        return;
      }

      if (data) {
        console.log('Loaded cards:', data.length);
        setMoveInCards(data);
      } else {
        console.log('No data returned');
        setMoveInCards([]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setError('입주카드를 불러오는데 실패했습니다.');
    }
  };

  const updateCardStatus = async (cardId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('move_in_cards')
        .update({ 
          status, 
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId);

      if (error) throw error;

      await loadMoveInCards();
    } catch (error) {
      console.error('Error updating status:', error);
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

  const handleApprove = (card: MoveInCard) => {
    setSelectedCard({ ...card, action: 'approve' } as any);
    setIsNotesModalOpen(true);
  };

  const handleReject = (card: MoveInCard) => {
    setSelectedCard({ ...card, action: 'reject' } as any);
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedCard) {
      const action = (selectedCard as any).action;
      updateCardStatus(selectedCard.id, action === 'approve' ? 'approved' : 'rejected', notes);
    }
  };

  const handleDelete = (card: MoveInCard) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      const { error } = await supabase
        .from('move_in_cards')
        .delete()
        .eq('id', cardToDelete.id);

      if (error) throw error;

      // 삭제 성공 후 리스트 새로고침
      await loadMoveInCards();
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
      
      // 성공 메시지 (선택사항)
      console.log('입주카드가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting card:', error);
      setError('입주카드 삭제에 실패했습니다.');
      // 에러가 발생해도 모달은 닫지 않음
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


  const getFilterCount = (status: string) => {
    let cards = moveInCards;
    
    // 일반 검색어가 있으면 검색 결과에서 카운트
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      cards = cards.filter(card => 
        card.company_name?.toLowerCase().includes(searchLower) ||
        card.contact_person?.toLowerCase().includes(searchLower) ||
        card.contact_email?.toLowerCase().includes(searchLower) ||
        card.contact_phone?.toLowerCase().includes(searchLower) ||
        card.business_type?.toLowerCase().includes(searchLower) ||
        card.floor_number?.toLowerCase().includes(searchLower) ||
        card.room_number?.toLowerCase().includes(searchLower) ||
        card.profiles?.name?.toLowerCase().includes(searchLower) ||
        card.profiles?.email?.toLowerCase().includes(searchLower)
      );
    }

    // 호수 검색이 있으면 추가 필터링
    if (roomSearch.trim()) {
      const roomLower = roomSearch.toLowerCase();
      cards = cards.filter(card => 
        card.room_number?.toLowerCase().includes(roomLower) ||
        card.floor_number?.toLowerCase().includes(roomLower)
      );
    }
    
    if (status === 'all') return cards.length;
    return cards.filter(card => card.status === status).length;
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
              <span className="ml-4 text-gray-600">관리자 대시보드</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/notices"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-notification-line"></i>
                <span>공지사항 관리</span>
              </Link>
              <Link
                to="/admin/complaints"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-customer-service-line"></i>
                <span>민원 관리</span>
              </Link>
              <Link
                to="/admin/move-in-card/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap flex items-center space-x-2"
              >
                <i className="ri-add-line"></i>
                <span>새 입주카드</span>
              </Link>
              <span className="text-gray-700">관리자: {profile?.name}님</span>
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
          {/* 상단 통계 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-file-list-3-line text-2xl text-gray-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">전체</dt>
                      <dd className="text-lg font-medium text-gray-900">{getFilterCount('all')}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-time-line text-2xl text-yellow-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">검토중</dt>
                      <dd className="text-lg font-medium text-gray-900">{getFilterCount('pending')}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-check-line text-2xl text-green-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">승인됨</dt>
                      <dd className="text-lg font-medium text-gray-900">{getFilterCount('approved')}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-close-line text-2xl text-red-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">반려됨</dt>
                      <dd className="text-lg font-medium text-gray-900">{getFilterCount('rejected')}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 필터 탭 */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: '전체' },
                { key: 'pending', label: '검토중' },
                { key: 'approved', label: '승인됨' },
                { key: 'rejected', label: '반려됨' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({getFilterCount(tab.key)})
                </button>
              ))}
            </nav>
          </div>

          {/* 검색 입력 */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 일반 검색 */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  입주카드 검색
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="회사명, 담당자명, 이메일, 전화번호로 검색..."
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className="ri-close-line text-gray-400 hover:text-gray-600"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* 호수 검색 */}
              <div>
                <label htmlFor="roomSearch" className="block text-sm font-medium text-gray-700 mb-2">
                  호수 검색
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-building-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="roomSearch"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="호수 또는 층수로 검색 (예: 501, 5층)"
                  />
                  {roomSearch && (
                    <button
                      onClick={() => setRoomSearch('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className="ri-close-line text-gray-400 hover:text-gray-600"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 검색 결과 요약 */}
            {(searchTerm || roomSearch) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <i className="ri-search-line text-blue-500 mr-2"></i>
                  <span className="text-sm text-blue-700">
                    {searchTerm && `"${searchTerm}"`}
                    {searchTerm && roomSearch && ' + '}
                    {roomSearch && `호수: "${roomSearch}"`}
                    {' '}검색 결과: {filteredCards.length}개
                  </span>
                  {(searchTerm || roomSearch) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setRoomSearch('');
                      }}
                      className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      전체 초기화
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 입주카드 목록 */}
          {filteredCards.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <i className="ri-file-list-3-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(searchTerm || roomSearch) ? '검색 결과가 없습니다' : '입주카드가 없습니다'}
              </h3>
              <p className="text-gray-600">
                {(searchTerm || roomSearch) 
                  ? `검색 조건에 맞는 입주카드가 없습니다. 다른 검색어를 시도해보세요.`
                  : '해당 상태의 입주카드가 없습니다.'
                }
              </p>
              {(searchTerm || roomSearch) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoomSearch('');
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  검색 초기화
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredCards.map((card) => (
                  <li key={card.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-medium text-blue-600 truncate">
                                {card.company_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                신청자: {(card as any).profiles?.name} ({(card as any).profiles?.email})
                              </p>
                            </div>
                            {getStatusBadge(card.status)}
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <strong>업종:</strong> {card.business_type}
                              </p>
                              <p className="text-sm text-gray-500">
                                <strong>위치:</strong> {card.floor_number}층 {card.room_number}호
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                <strong>입주일:</strong> {new Date(card.move_in_date).toLocaleDateString('ko-KR')}
                              </p>
                              <p className="text-sm text-gray-500">
                                <strong>직원 수:</strong> {card.employee_count}명
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                <strong>주차:</strong> {card.parking_needed ? `${card.parking_count}대 필요` : '불필요'}
                              </p>
                              <p className="text-sm text-gray-500">
                                <strong>신청일:</strong> {new Date(card.created_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                          {card.special_requests && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>특별 요청사항:</strong> {card.special_requests}
                              </p>
                            </div>
                          )}
                          {card.admin_notes && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>관리자 메모:</strong> {card.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <Link
                            to={`/move-in-card/${card.id}`}
                            className="text-blue-600 hover:text-blue-500 cursor-pointer px-3 py-1 rounded text-sm transition-colors duration-200"
                            title="상세보기"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <Link
                            to={`/move-in-card/edit/${card.id}`}
                            className="text-yellow-600 hover:text-yellow-500 cursor-pointer px-3 py-1 rounded text-sm transition-colors duration-200"
                            title="수정"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(card)}
                            className="text-red-600 hover:text-red-500 cursor-pointer px-3 py-1 rounded text-sm transition-colors duration-200"
                            title="삭제"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                          {card.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(card)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap transition-colors duration-200"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(card)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap transition-colors duration-200"
                              >
                                반려
                              </button>
                            </>
                          )}
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

      {/* Admin Notes Modal */}
      <AdminNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleSaveNotes}
        currentNotes={selectedCard?.admin_notes || ''}
        companyName={selectedCard?.company_name || ''}
        action={(selectedCard as any)?.action || 'approve'}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && cardToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">입주카드 삭제</h2>
                  <p className="text-red-100 text-sm mt-1">{cardToDelete.company_name}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCardToDelete(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  정말로 이 입주카드를 삭제하시겠습니까?
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    <strong>회사명:</strong> {cardToDelete.company_name}<br/>
                    <strong>업종:</strong> {cardToDelete.business_type}<br/>
                    <strong>상태:</strong> {getStatusText(cardToDelete.status)}
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-3">
                  ⚠️ 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCardToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}