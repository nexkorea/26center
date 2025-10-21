import React, { useState, useEffect } from 'react';
import { supabase, type Notice } from '../lib/supabase';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  notice?: Notice | null;
  mode: 'create' | 'edit';
}

const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notice,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false,
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && notice) {
        setFormData({
          title: notice.title,
          content: notice.content,
          is_important: notice.is_important,
          is_published: notice.is_published
        });
      } else {
        setFormData({
          title: '',
          content: '',
          is_important: false,
          is_published: true
        });
      }
      setError('');
    }
  }, [isOpen, mode, notice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 인증이 필요합니다.');

      if (mode === 'create') {
        const { error } = await supabase
          .from('notices')
          .insert({
            title: formData.title.trim(),
            content: formData.content.trim(),
            author_id: user.id,
            is_important: formData.is_important,
            is_published: formData.is_published
          });

        if (error) throw error;
      } else if (mode === 'edit' && notice) {
        const { error } = await supabase
          .from('notices')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            is_important: formData.is_important,
            is_published: formData.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', notice.id);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('공지사항 저장 오류:', error);
      setError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] transform transition-all duration-300 scale-100 flex flex-col">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'create' ? '새 공지사항 작성' : '공지사항 수정'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {mode === 'create' ? '새로운 공지사항을 작성하세요' : '공지사항을 수정하세요'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="공지사항 제목을 입력하세요"
                disabled={loading}
                maxLength={255}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/255
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                placeholder="공지사항 내용을 입력하세요"
                rows={12}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                줄바꿈은 자동으로 적용됩니다.
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Important */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  disabled={loading}
                />
                <label htmlFor="is_important" className="text-sm font-medium text-gray-700">
                  <i className="ri-fire-line text-red-500 mr-1"></i>
                  중요 공지사항
                </label>
              </div>

              {/* Published */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={loading}
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  <i className="ri-eye-line text-green-500 mr-1"></i>
                  즉시 발행
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <i className="ri-error-warning-line text-red-500 mr-2"></i>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {formData.is_important && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <i className="ri-fire-line mr-1"></i>
                      중요
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    formData.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.is_published ? '발행됨' : '임시저장'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">
                  {formData.title || '제목을 입력하세요'}
                </h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {formData.content || '내용을 입력하세요'}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <i className="ri-save-line"></i>
                  {mode === 'create' ? '작성하기' : '수정하기'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;

