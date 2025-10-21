
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Logo26Building from '../../components/Logo26Building';
import NoticeList from '../../components/NoticeList';
import BuildingSlider from '../../components/BuildingSlider';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasMoveInCard, setHasMoveInCard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
      
      if (user) {
        // 사용자가 입주카드를 작성했는지 확인
        await checkMoveInCard(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMoveInCard = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('move_in_cards')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error checking move-in card:', error);
        return;
      }

      setHasMoveInCard(data && data.length > 0);
    } catch (error) {
      console.error('Error checking move-in card:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
      setHasMoveInCard(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo26Building size={40} />
            </div>
            <nav className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <i className="ri-loader-4-line animate-spin text-gray-600"></i>
                  <span className="text-sm text-gray-600">로딩 중...</span>
                </div>
              ) : !isLoggedIn ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    로그인
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">
                    안녕하세요, {user?.user_metadata?.name || user?.email || '사용자'}님
                  </span>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    대시보드
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[800px] px-4 sm:px-6 lg:px-8">
        {/* 빌딩 이미지 슬라이더 */}
        <BuildingSlider className="absolute inset-0" />
        
        <div className="relative max-w-7xl mx-auto text-center flex flex-col justify-start h-full pt-20">
          <div className="z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              26센터 입주카드 시스템
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white mb-8 max-w-4xl mx-auto drop-shadow-md">
              간편하고 체계적인 입주자 정보 관리 시스템으로 효율적인 빌딩 운영을 시작하세요
            </p>
            {!isLoggedIn ? (
              <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
                입주카드를 작성하여 입주 신청을 시작하세요 (로그인 필요)
              </p>
            ) : (
              hasMoveInCard ? (
                <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
                  대시보드에서 입주카드를 관리하고 새로운 입주카드를 작성할 수 있습니다
                </p>
              ) : (
                <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
                  입주카드를 작성하여 입주 신청을 시작하세요
                </p>
              )
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoggedIn ? (
                <Link 
                  to="/move-in-card/new" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold cursor-pointer whitespace-nowrap inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  입주카드 작성
                </Link>
              ) : (
                hasMoveInCard ? (
                  <Link 
                    to="/dashboard" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold cursor-pointer whitespace-nowrap inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    대시보드로 이동
                  </Link>
                ) : (
                  <Link 
                    to="/move-in-card/new" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold cursor-pointer whitespace-nowrap inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    새 입주카드 작성
                  </Link>
                )
              )}
              <Link 
                to="/admin" 
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold cursor-pointer whitespace-nowrap inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                관리자 로그인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notices Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 공지사항 */}
            <NoticeList limit={5} showTitle={true} />
            
            {/* 추가 정보 또는 다른 위젯 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 링크</h2>
              <div className="space-y-4">
                <Link 
                  to="/move-in-card/new" 
                  className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-200">
                    <i className="ri-file-add-line text-xl text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">입주카드 작성</h3>
                    <p className="text-sm text-gray-600">새로운 입주카드를 작성하세요</p>
                  </div>
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-200">
                    <i className="ri-dashboard-line text-xl text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">내 대시보드</h3>
                    <p className="text-sm text-gray-600">입주카드 현황을 확인하세요</p>
                  </div>
                </Link>
                
                <Link 
                  to="/complaints/new" 
                  className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors duration-200 group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors duration-200">
                    <i className="ri-customer-service-line text-xl text-orange-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">민원접수</h3>
                    <p className="text-sm text-gray-600">26빌딩 관련 민원을 접수하세요</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin" 
                  className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200 group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-200">
                    <i className="ri-settings-3-line text-xl text-purple-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">관리자 로그인</h3>
                    <p className="text-sm text-gray-600">관리자 페이지로 이동하세요</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              주요 기능
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              26빌딩 입주카드 시스템의 핵심 기능들을 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-user-add-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">간편한 회원가입</h3>
              <p className="text-gray-600">
                빠르고 간단한 회원가입 절차로 입주자 등록을 쉽게 완료할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-text-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">입주카드 작성</h3>
              <p className="text-gray-600">
                체계적인 양식으로 입주자 정보를 정확하고 완전하게 기록할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-settings-3-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">관리자 시스템</h3>
              <p className="text-gray-600">
                모든 입주카드를 효율적으로 관리하고 승인할 수 있는 관리자 도구를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              입주 절차
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              간단한 3단계로 입주 절차를 완료하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">회원가입</h3>
              <p className="text-gray-600">
                기본 정보를 입력하여 계정을 생성합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">입주카드 작성</h3>
              <p className="text-gray-600">
                상세한 입주자 정보를 입력하여 카드를 작성합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">승인 완료</h3>
              <p className="text-gray-600">
                관리자 승인 후 입주가 완료됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!isLoggedIn ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                26빌딩의 새로운 입주자가 되어 편리한 빌딩 생활을 경험해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap inline-block"
                >
                  회원가입
                </Link>
                <Link 
                  to="/move-in-card/new" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap inline-block"
                >
                  입주카드 작성
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                환영합니다!
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {user?.user_metadata?.name || user?.email || '사용자'}님, 26빌딩 입주카드 시스템을 이용해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hasMoveInCard ? (
                  <Link 
                    to="/dashboard" 
                    className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap inline-block"
                  >
                    대시보드로 이동
                  </Link>
                ) : (
                  <Link 
                    to="/move-in-card/new" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap inline-block"
                  >
                    새 입주카드 작성
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Logo26Building size={32} />
              </div>
              <p className="text-gray-400 mb-4">
                효율적이고 체계적인 입주자 관리 시스템으로 더 나은 빌딩 운영을 제공합니다.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white cursor-pointer">입주자 등록</Link></li>
                <li><Link to="/card-form" className="hover:text-white cursor-pointer">입주카드 작성</Link></li>
                <li><Link to="/admin" className="hover:text-white cursor-pointer">관리자 시스템</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">고객센터</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">FAQ</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 26빌딩. All rights reserved. | <a href="https://readdy.ai/?origin=logo" className="hover:text-white cursor-pointer">Website Builder</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
