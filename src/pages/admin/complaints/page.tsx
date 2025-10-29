import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Complaint, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function AdminComplaintsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile && user) {
      loadComplaints();
    }
  }, [profile, user, filter]);

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
    } catch (error) {
      console.error('사용자 확인 오류:', error);
      setError('사용자 정보를 확인하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('관리자 민원 로딩 시작:', { profile, isAdmin: profile?.is_admin });
      
      // 관리자 권한 확인
      if (!profile?.is_admin) {
        console.log('관리자 권한 없음');
        setError('관리자 권한이 필요합니다.');
        return;
      }
      
      console.log('Supabase 쿼리 시작');
      
      // 먼저 간단한 쿼리로 테스트
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      console.log('Supabase 쿼리 결과:', { data, error });

      if (error) {
        console.error('Supabase 오류:', error);
        throw error;
      }

      // JOIN 쿼리로 사용자 정보 가져오기
      const complaintsWithProfiles = await Promise.all(
        (data || []).map(async (complaint) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', complaint.user_id)
            .single();

          const { data: adminData } = complaint.admin_id ? await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', complaint.admin_id)
            .single() : { data: null };

          return {
            ...complaint,
            profiles: profileData,
            admin_profiles: adminData
          };
        })
      );

      console.log('민원 데이터 설정:', complaintsWithProfiles);
      setComplaints(complaintsWithProfiles);
    } catch (error) {
      console.error('민원 목록 로딩 오류:', error);
      setError(`민원 목록을 불러오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.admin_response || '');
    setSelectedStatus(complaint.status);
    setIsResponseModalOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);
      setError('');

      const updateData: any = {
        admin_id: user.id,
        response_date: new Date().toISOString(),
        status: selectedStatus,
        updated_at: new Date().toISOString()
      };

      // 답변이 있는 경우에만 admin_response 업데이트
      if (responseText.trim()) {
        updateData.admin_response = responseText.trim();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', selectedComplaint.id);

      if (error) throw error;

      await loadComplaints();
      setIsResponseModalOpen(false);
      setSelectedComplaint(null);
      setResponseText('');
      setSelectedStatus('');
    } catch (error) {
      console.error('답변 제출 오류:', error);
      setError('답변 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (complaint: Complaint, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaint.id);

      if (error) throw error;

      await loadComplaints();
    } catch (error) {
      console.error('상태 변경 오류:', error);
      setError('상태 변경에 실패했습니다.');
    }
  };

  // 민원 삭제 모달 열기
  const deleteComplaint = (complaint: Complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  // 민원 삭제 확인
  const confirmDeleteComplaint = async () => {
    if (!complaintToDelete) return;

    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaintToDelete.id);

      if (error) throw error;

      // 목록 새로고침
      await loadComplaints();
      setIsDeleteModalOpen(false);
      setComplaintToDelete(null);
      setError('');
    } catch (error) {
      console.error('민원 삭제 오류:', error);
      setError('민원 삭제에 실패했습니다.');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '접수됨';
      case 'in_progress':
        return '처리중';
      case 'resolved':
        return '해결됨';
      case 'closed':
        return '종료됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'normal':
        return 'text-blue-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryText = (category: string) => {
    const categories: { [key: string]: string } = {
      'facility': '시설 관련',
      'security': '보안 관련',
      'noise': '소음 관련',
      'parking': '주차 관련',
      'elevator': '엘리베이터',
      'cleaning': '청소 관련',
      'management': '관리사무소',
      'other': '기타'
    };
    return categories[category] || category;
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
              <h1 className="text-3xl font-bold text-gray-900">민원 관리</h1>
              <p className="text-gray-600 mt-2">접수된 민원을 확인하고 답변하세요.</p>
            </div>
            <div className="text-sm text-gray-500">
              총 {complaints.length}개의 민원
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[
                { value: 'all', label: '전체' },
                { value: 'pending', label: '접수됨' },
                { value: 'in_progress', label: '처리중' },
                { value: 'resolved', label: '해결됨' },
                { value: 'closed', label: '종료됨' }
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filter === filterOption.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-customer-service-line text-6xl text-gray-400 mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">민원이 없습니다</h2>
                <p className="text-gray-600">새로운 민원이 접수되면 여기에 표시됩니다.</p>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {getStatusText(complaint.status)}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority === 'low' ? '낮음' : 
                           complaint.priority === 'normal' ? '보통' :
                           complaint.priority === 'high' ? '높음' : '긴급'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getCategoryText(complaint.category)}
                        </span>
                        {complaint.is_anonymous ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <i className="ri-eye-off-line mr-1"></i>
                            익명
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {complaint.profiles?.name}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {complaint.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {complaint.content}
                      </p>

                      {complaint.admin_response && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="ri-customer-service-2-line text-blue-600"></i>
                            <span className="text-sm font-medium text-blue-900">관리자 답변</span>
                            {complaint.admin_profiles && (
                              <span className="text-xs text-blue-700">
                                by {complaint.admin_profiles.name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-800 line-clamp-2">
                            {complaint.admin_response}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>접수: {formatDate(complaint.created_at)}</span>
                        {complaint.response_date && (
                          <span>답변: {formatDate(complaint.response_date)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => handleResponse(complaint)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="답변하기"
                      >
                        <i className="ri-message-3-line"></i>
                      </button>
                      
                      {complaint.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(complaint, 'in_progress')}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                          title="처리중으로 변경"
                        >
                          <i className="ri-play-circle-line"></i>
                        </button>
                      )}
                      
                      {complaint.status === 'resolved' && (
                        <button
                          onClick={() => updateStatus(complaint, 'closed')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          title="종료하기"
                        >
                          <i className="ri-checkbox-circle-line"></i>
                        </button>
                      )}
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => deleteComplaint(complaint)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="삭제하기"
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

      {/* Response Modal */}
      {isResponseModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100">
            <div className="bg-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">민원 답변</h2>
                  <p className="text-blue-100 text-sm mt-1">{selectedComplaint.title}</p>
                </div>
                <button
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setSelectedComplaint(null);
                    setResponseText('');
                    setSelectedStatus('');
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">민원 내용</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.content}</p>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 답변
                </label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                  placeholder="민원에 대한 답변을 입력하세요"
                  rows={6}
                  disabled={submitting}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  처리 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  disabled={submitting}
                >
                  <option value="pending">접수됨</option>
                  <option value="in_progress">처리중</option>
                  <option value="resolved">해결됨</option>
                  <option value="closed">종료됨</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  민원의 현재 처리 상태를 선택하세요
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setSelectedComplaint(null);
                    setResponseText('');
                    setSelectedStatus('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  취소
                </button>
                <button
                  onClick={submitResponse}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      답변 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-line"></i>
                      답변 제출
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && complaintToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="bg-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">민원 삭제</h2>
                  <p className="text-red-100 text-sm mt-1">{complaintToDelete.title}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setComplaintToDelete(null);
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
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="ri-delete-bin-line text-3xl text-red-600"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  정말로 이 민원을 삭제하시겠습니까?
                </h3>
                <p className="text-gray-600 text-center">
                  삭제된 민원은 복구할 수 없습니다.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-20">제목:</span>
                    <span className="text-gray-900">{complaintToDelete.title}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-20">카테고리:</span>
                    <span className="text-gray-900">{getCategoryText(complaintToDelete.category)}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-20">상태:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaintToDelete.status)}`}>
                      {getStatusText(complaintToDelete.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setComplaintToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeleteComplaint}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <i className="ri-delete-bin-line"></i>
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
