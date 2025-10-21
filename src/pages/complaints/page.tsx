import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Complaint, type Profile } from '../../lib/supabase';
import Logo26Building from '../../components/Logo26Building';

export default function ComplaintsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'>('all');
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
      
      if (!user?.id) {
        setError('사용자 정보가 없습니다.');
        return;
      }
      
      // 먼저 간단한 쿼리로 테스트
      let query = supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

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
      
      setComplaints(complaintsWithProfiles);
    } catch (error) {
      console.error('민원 목록 로딩 오류:', error);
      setError(`민원 목록을 불러오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
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
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center space-x-3">
              <Logo26Building size={40} />
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                대시보드
              </Link>
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                홈으로
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{profile?.name || '사용자'}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                로그아웃
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
              <h1 className="text-3xl font-bold text-gray-900">민원접수</h1>
              <p className="text-gray-600 mt-2">26빌딩 관련 민원을 확인하고 관리하세요.</p>
            </div>
            <Link
              to="/complaints/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="ri-add-line"></i>
              새 민원 접수
            </Link>
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
                <p className="text-gray-600 mb-6">새로운 민원을 접수해보세요.</p>
                <Link
                  to="/complaints/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  첫 민원 접수하기
                </Link>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="block group"
                >
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group-hover:bg-blue-50/30">
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
                          {complaint.is_anonymous && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <i className="ri-eye-off-line mr-1"></i>
                              익명
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                          {complaint.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {complaint.content}
                        </p>

                        {complaint.admin_response && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <i className="ri-customer-service-2-line text-blue-600"></i>
                              <span className="text-sm font-medium text-blue-900">관리자 답변</span>
                            </div>
                            <p className="text-sm text-blue-800 line-clamp-1">
                              {complaint.admin_response}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(complaint.created_at)}</span>
                          {complaint.response_date && (
                            <span>답변: {formatDate(complaint.response_date)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <i className="ri-arrow-right-s-line text-lg group-hover:translate-x-1 transition-transform duration-200 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
