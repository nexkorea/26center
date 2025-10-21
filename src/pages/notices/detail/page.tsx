import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Notice } from '../../../lib/supabase';
import Logo26Building from '../../../components/Logo26Building';

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadNotice(id);
    }
  }, [id]);

  const loadNotice = async (noticeId: string) => {
    try {
      setLoading(true);
      
      // 공지사항 조회수 증가
      await supabase.rpc('increment_notice_view_count', { notice_id: noticeId });
      
      // 공지사항 상세 정보 로드
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('id', noticeId)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setNotice(data);
    } catch (error) {
      console.error('공지사항 로딩 오류:', error);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
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
                  to="/notices" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  목록으로
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notice) {
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
                  to="/notices" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  목록으로
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">공지사항을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">
              {error || '요청하신 공지사항이 존재하지 않거나 삭제되었습니다.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/notices"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                목록으로
              </Link>
              <Link 
                to="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                홈으로
              </Link>
            </div>
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
                to="/notices" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                목록으로
              </Link>
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              {notice.is_important && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <i className="ri-fire-line mr-1"></i>
                  중요
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(notice.created_at)}
              </span>
              {notice.profiles && (
                <span className="text-sm text-gray-500">
                  by {notice.profiles.name}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {notice.title}
            </h1>
            
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

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: notice.content.replace(/\n/g, '<br>') 
              }}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center justify-between">
              <Link 
                to="/notices"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                <i className="ri-arrow-left-line"></i>
                목록으로 돌아가기
              </Link>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
                >
                  <i className="ri-printer-line"></i>
                  인쇄
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('링크가 복사되었습니다.');
                  }}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
                >
                  <i className="ri-links-line"></i>
                  링크 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

