import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Notice } from '../../lib/supabase';
import Logo26Building from '../../components/Logo26Building';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('is_published', true)
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
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
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={loadNotices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              다시 시도
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
            <div className="hidden sm:block text-sm text-gray-500">
              총 {notices.length}개의 공지사항
            </div>
          </div>

          {notices.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-notification-line text-6xl text-gray-400 mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">공지사항이 없습니다</h2>
              <p className="text-gray-600">새로운 공지사항이 등록되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  to={`/notices/${notice.id}`}
                  className="block group"
                >
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group-hover:bg-blue-50/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
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
                        
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3">
                          {notice.title}
                        </h3>
                        
                        <p className="text-gray-600 line-clamp-3">
                          {notice.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                          {notice.content.length > 200 && '...'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-6 text-sm text-gray-500">
                        <div className="hidden md:flex items-center gap-1">
                          <i className="ri-eye-line"></i>
                          <span>{notice.view_count}</span>
                        </div>
                        <i className="ri-arrow-right-s-line text-xl group-hover:translate-x-1 transition-transform duration-200"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

