import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Notice } from '../lib/supabase';

interface NoticeListProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

const NoticeList: React.FC<NoticeListProps> = ({ 
  limit = 5, 
  showTitle = true,
  className = ''
}) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotices();
  }, [limit]);

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
        .order('created_at', { ascending: false })
        .limit(limit);

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">공지사항</h2>
            <Link 
              to="/notices" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              전체보기 →
            </Link>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4">공지사항</h2>
        )}
        <div className="text-center text-gray-500 py-8">
          <i className="ri-error-warning-line text-4xl mb-2"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4">공지사항</h2>
        )}
        <div className="text-center text-gray-500 py-8">
          <i className="ri-notification-line text-4xl mb-2"></i>
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">공지사항</h2>
          <Link 
            to="/notices" 
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
          >
            전체보기 →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <Link
            key={notice.id}
            to={`/notices/${notice.id}`}
            className="block group"
          >
            <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 group-hover:bg-blue-50/30">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {notice.is_important && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <i className="ri-fire-line mr-1"></i>
                        중요
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(notice.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {notice.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {notice.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                    {notice.content.length > 100 && '...'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 ml-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <i className="ri-eye-line"></i>
                    <span>{notice.view_count}</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-lg group-hover:translate-x-1 transition-transform duration-200"></i>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NoticeList;

