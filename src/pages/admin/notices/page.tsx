import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Notice, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';
import NoticeModal from '../../../components/NoticeModal';

export default function AdminNoticesPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // 관리자 권한 확인
      if (!profileData?.is_admin) {
        setError('관리자 권한이 필요합니다.');
        return;
      }

      await loadNotices();
    } catch (error) {
      console.error('사용자 확인 오류:', error);
      setError('사용자 정보를 확인하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('공지사항 로딩 오류:', error);
      setError('공지사항을 불러오는데 실패했습니다.');
    }
  };

  const handleCreate = () => {
    setSelectedNotice(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditModalOpen(true);
  };

  const handleDelete = (notice: Notice) => {
    setNoticeToDelete(notice);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!noticeToDelete) return;

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeToDelete.id);

      if (error) throw error;

      await loadNotices();
      setIsDeleteModalOpen(false);
      setNoticeToDelete(null);
    } catch (error) {
      console.error('공지사항 삭제 오류:', error);
      setError('공지사항 삭제에 실패했습니다.');
    }
  };

  const toggleImportant = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_important: !notice.is_important })
        .eq('id', notice.id);

      if (error) throw error;

      await loadNotices();
    } catch (error) {
      console.error('중요도 변경 오류:', error);
      setError('중요도 변경에 실패했습니다.');
    }
  };

  const togglePublished = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_published: !notice.is_published })
        .eq('id', notice.id);

      if (error) throw error;

      await loadNotices();
    } catch (error) {
      console.error('발행 상태 변경 오류:', error);
      setError('발행 상태 변경에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <Logo26Building size={40} />
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/admin" 
                className="text-gray-600 hover:text-gray-900 font-medium px-2 sm:px-0"
                title="관리자 대시보드"
              >
                <span className="hidden sm:inline">관리자 대시보드</span>
                <i className="ri-dashboard-line sm:hidden text-lg"></i>
              </Link>
              <span className="hidden md:inline text-gray-400">|</span>
              <span className="hidden lg:inline text-gray-600 text-sm">{profile?.name || '관리자'}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium px-2 sm:px-0"
                title="로그아웃"
              >
                <span className="hidden sm:inline">로그아웃</span>
                <i className="ri-logout-box-line sm:hidden text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
              <p className="text-gray-600 mt-2">공지사항을 작성, 수정, 삭제할 수 있습니다.</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="ri-add-line"></i>
              새 공지사항
            </button>
          </div>

          {/* Notices List */}
          <div className="space-y-4">
            {notices.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-notification-line text-6xl text-gray-400 mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">공지사항이 없습니다</h2>
                <p className="text-gray-600 mb-6">새로운 공지사항을 작성해보세요.</p>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  첫 공지사항 작성
                </button>
              </div>
            ) : (
              notices.map((notice) => (
                <div key={notice.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {notice.is_important && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <i className="ri-fire-line mr-1"></i>
                            중요
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notice.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notice.is_published ? '발행됨' : '임시저장'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(notice.created_at)}
                        </span>
                        {notice.profiles && (
                          <span className="text-sm text-gray-500">
                            by {notice.profiles.name}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {notice.title}
                      </h3>
                      
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {notice.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                        {notice.content.length > 200 && '...'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <i className="ri-eye-line"></i>
                          <span>조회 {notice.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          <span>수정 {formatDate(notice.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => toggleImportant(notice)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          notice.is_important
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={notice.is_important ? '중요 해제' : '중요 표시'}
                      >
                        <i className="ri-fire-line"></i>
                      </button>
                      
                      <button
                        onClick={() => togglePublished(notice)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          notice.is_published
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={notice.is_published ? '발행 취소' : '발행하기'}
                      >
                        <i className={notice.is_published ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </button>
                      
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="수정"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(notice)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="삭제"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && noticeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">공지사항 삭제</h2>
                  <p className="text-red-100 text-sm mt-1">{noticeToDelete.title}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setNoticeToDelete(null);
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
                  정말로 이 공지사항을 삭제하시겠습니까?
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    <strong>제목:</strong> {noticeToDelete.title}<br/>
                    <strong>상태:</strong> {noticeToDelete.is_published ? '발행됨' : '임시저장'}<br/>
                    <strong>중요도:</strong> {noticeToDelete.is_important ? '중요' : '일반'}
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
                    setNoticeToDelete(null);
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

      {/* Create/Edit Modal */}
      <NoticeModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedNotice(null);
        }}
        onSave={loadNotices}
        notice={selectedNotice}
        mode={isCreateModalOpen ? 'create' : 'edit'}
      />
    </div>
  );
}
