
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Logo26Building from '../../components/Logo26Building';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // 이메일 미인증 에러 처리
        if (error.message.includes('Email not confirmed')) {
          setShowResendEmail(true);
          throw new Error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
        }
        throw error;
      }

      if (data.user) {
        // 프로필 정보 확인
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const metaName = (data.user.user_metadata?.name as string | undefined) || (data.user.email || '').split('@')[0] || '사용자';
        const metaPhone = (data.user.user_metadata?.phone as string | undefined) || null;

        // 프로필이 없으면 자동 생성 (upsert로 중복 방지)
        if (!profileRow) {
          const { error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: metaName,
              email: data.user.email,
              phone: metaPhone,
              role: 'user'
            }, { onConflict: 'id' });
          if (createError && !String(createError.message || '').includes('duplicate key')) {
            throw createError;
          }
        } else {
          // 기존 프로필에 name/phone이 비어있으면 메타데이터로 보정
          const needsName = !profileRow.name && metaName;
          const needsPhone = !profileRow.phone && metaPhone;
          if (needsName || needsPhone) {
            await supabase
              .from('profiles')
              .update({
                name: needsName ? metaName : profileRow.name,
                phone: needsPhone ? metaPhone : profileRow.phone,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id);
          }
        }

        const role = profileRow?.role || 'user';
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 이메일 인증 재전송
  const handleResendEmail = async () => {
    try {
      setResendSuccess('');
      setError('');
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) throw error;

      setResendSuccess('인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.');
      setShowResendEmail(false);
    } catch (error: any) {
      setError(error.message || '이메일 전송에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center items-center">
            <Logo26Building size={48} />
          </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          또는{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
            새 계정 만들기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <p>{error}</p>
              {showResendEmail && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                >
                  인증 이메일 재전송
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {resendSuccess}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 주소
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
