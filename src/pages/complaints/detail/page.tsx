import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase, type Complaint, type Profile } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function ComplaintDetailPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile && user && id) {
      loadComplaint();
    }
  }, [profile, user, id]);

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
      setIsAdmin(profileData?.is_admin || false);
    } catch (error) {
      console.error('사용자 확인 오류:', error);
      setError('사용자 정보를 확인하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaint = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles (
            name,
            email
          ),
          admin_profiles:admin_id (
            name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // 권한 확인: 본인 민원이거나 관리자여야 함
      if (!isAdmin && data.user_id !== user?.id) {
        setError('접근 권한이 없습니다.');
        return;
      }

      setComplaint(data);
    } catch (error) {
      console.error('민원 상세 로딩 오류:', error);
      setError('민원 정보를 불러오는데 실패했습니다.');
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
      month: 'long',
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

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="ri-file-damage-line text-6xl text-gray-400 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">민원을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">요청하신 민원이 존재하지 않거나 삭제되었습니다.</p>
            <Link
              to={isAdmin ? '/admin/complaints' : '/complaints'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              목록으로 돌아가기
            </Link>
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
                to={isAdmin ? '/admin/complaints' : '/complaints'}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {isAdmin ? '민원 관리' : '민원목록'}
              </Link>
              {isAdmin ? (
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  관리자 대시보드
                </Link>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  대시보드
                </Link>
              )}
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                홈으로
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{profile?.name || (isAdmin ? '관리자' : '사용자')}</span>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
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
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {complaint.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>접수일: {formatDate(complaint.created_at)}</span>
                {complaint.response_date && (
                  <span>답변일: {formatDate(complaint.response_date)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">민원 내용</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {complaint.content}
              </p>
            </div>
          </div>

          {/* Admin Response */}
          {complaint.admin_response && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">관리자 답변</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-customer-service-2-line text-blue-600"></i>
                  <span className="font-medium text-blue-900">관리자 답변</span>
                  {complaint.admin_profiles && (
                    <span className="text-sm text-blue-700">
                      by {complaint.admin_profiles.name}
                    </span>
                  )}
                </div>
                <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                  {complaint.admin_response}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link
              to={isAdmin ? '/admin/complaints' : '/complaints'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              목록으로 돌아가기
            </Link>
            
            {isAdmin && (
              <div className="flex gap-3">
                <Link
                  to={`/admin/complaints`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  민원 관리로 이동
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
