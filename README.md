# 26빌딩 입주카드 관리 시스템

건물 입주자의 정보를 체계적으로 관리하고 승인하는 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend**: React 19.1.0 + TypeScript 5.8.3
- **Routing**: React Router DOM 7.6.3
- **Styling**: Tailwind CSS 3.4.17
- **Build Tool**: Vite 7.0.3
- **Backend**: Supabase (인증, 데이터베이스)
- **국제화**: i18next

## 📋 주요 기능

### 사용자 기능
- ✅ 회원가입 및 로그인 (이메일 인증)
- ✅ **4단계 입주카드 작성** 
  - 단계별 진행 표시 바
  - 실시간 유효성 검사
  - 자동 저장 기능
  - 모던한 카드 UI
- ✅ 본인 입주카드 조회 및 상태 확인
- ✅ 관리자 메모 확인
- ✅ 민원 접수 기능
  - 다양한 카테고리 분류 (시설, 보안, 소음, 주차 등)
  - 우선순위 설정 (낮음/보통/높음/긴급)
  - 익명 접수 옵션
- ✅ 본인 민원 조회 및 답변 확인

### 관리자 기능
- ✅ 전체 입주카드 조회
- ✅ 상태별 필터링 (검토중/승인/반려)
- ✅ 입주카드 승인/반려 처리
- ✅ 관리자 메모 작성
- ✅ 민원 관리
  - 전체 민원 조회 및 상태별 필터링
  - 민원 답변 작성
  - **처리 상태 변경** (접수됨/처리중/해결됨/종료됨)
  - **악성민원 삭제 기능**
  - 우선순위별 관리

### UI/UX 특징
- 🎨 **현대적인 디자인**: 그라데이션, 카드 레이아웃, 부드러운 애니메이션
- 📱 **완전한 반응형**: 모바일, 태블릿, 데스크톱 모두 최적화
- ♿ **접근성**: 아이콘과 텍스트 레이블 조합
- ⚡ **빠른 피드백**: 실시간 유효성 검사 및 상태 표시

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
VITE_PUBLIC_SUPABASE_URL=your-supabase-project-url
VITE_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Supabase 키 확인 방법:**
1. https://supabase.com 에 로그인
2. 프로젝트 선택
3. **Settings** > **API** 메뉴로 이동
4. **Project URL**과 **anon/public key**를 복사하여 `.env` 파일에 붙여넣기

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3001` (또는 표시된 포트)로 접속합니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `out/` 디렉토리에 생성됩니다.

## 🗄️ Supabase 데이터베이스 설정

### 필요한 테이블

#### 1. profiles 테이블

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 본인의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 관리자는 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 2. move_in_cards 테이블

```sql
CREATE TABLE move_in_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  floor_number TEXT NOT NULL,
  room_number TEXT NOT NULL,
  move_in_date DATE NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  employee_count INTEGER DEFAULT 0,
  parking_needed BOOLEAN DEFAULT FALSE,
  parking_count INTEGER DEFAULT 0,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE move_in_cards ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 입주카드만 조회 가능
CREATE POLICY "Users can view own cards"
  ON move_in_cards FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 본인의 입주카드만 생성 가능
CREATE POLICY "Users can create own cards"
  ON move_in_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 입주카드 조회 가능
CREATE POLICY "Admins can view all cards"
  ON move_in_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자는 모든 입주카드 수정 가능
CREATE POLICY "Admins can update all cards"
  ON move_in_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 3. complaints 테이블

```sql
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('facility', 'security', 'noise', 'parking', 'elevator', 'cleaning', 'management', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  admin_response TEXT,
  admin_id UUID REFERENCES profiles(id),
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 민원만 조회 가능
CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 본인의 민원만 생성 가능
CREATE POLICY "Users can create own complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 민원 조회 가능
CREATE POLICY "Admins can view all complaints"
  ON complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자는 모든 민원 수정/삭제 가능
CREATE POLICY "Admins can update all complaints"
  ON complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all complaints"
  ON complaints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 이메일 인증 설정

Supabase 대시보드에서 이메일 인증 설정을 조정할 수 있습니다:

#### 개발 환경 (이메일 인증 비활성화)

1. Supabase Dashboard > **Authentication** > **Providers** > **Email**
2. **"Confirm email"** 옵션을 **OFF**로 설정
3. 저장

#### 프로덕션 환경 (이메일 인증 활성화)

1. Supabase Dashboard > **Authentication** > **Providers** > **Email**
2. **"Confirm email"** 옵션을 **ON**으로 설정
3. **Email Templates**에서 인증 이메일 템플릿 커스터마이징
4. 저장

**참고**: 이메일 인증이 활성화된 경우:
- 회원가입 후 이메일 인증 필요
- 로그인 시 "Email not confirmed" 에러 발생 시 인증 이메일 재전송 버튼 제공

## 📁 프로젝트 구조

```
src/
├── App.tsx                 # 루트 컴포넌트
├── main.tsx               # 애플리케이션 진입점
├── index.css              # 글로벌 스타일
├── i18n/                  # 국제화 설정
│   ├── index.ts          
│   └── local/            
├── lib/
│   └── supabase.ts       # Supabase 클라이언트 및 타입 정의
├── pages/                # 페이지 컴포넌트
│   ├── home/            # 홈페이지 (랜딩 페이지)
│   ├── login/           # 로그인
│   ├── register/        # 회원가입
│   ├── dashboard/       # 사용자 대시보드
│   ├── admin/           # 관리자 대시보드
│   ├── move-in-card/new/ # 입주카드 작성
│   └── NotFound.tsx     # 404 페이지
└── router/              # 라우팅 설정
    ├── config.tsx       # 라우트 정의
    └── index.ts         # 라우터 컴포넌트
```

## 🔐 역할 및 권한

### User (일반 사용자)
- 회원가입, 로그인
- 입주카드 작성
- 본인 입주카드 조회
- `/dashboard` 접근

### Admin (관리자)
- 모든 입주카드 조회
- 입주카드 승인/반려
- 관리자 메모 작성
- `/admin` 접근

**관리자 계정 생성:**
Supabase SQL Editor에서 직접 역할 변경:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## 🚨 문제 해결

### 이메일 인증 에러

**증상**: 로그인 시 "Email not confirmed" 에러 발생

**해결 방법:**
1. **개발 환경**: Supabase에서 이메일 인증 비활성화 (위 설정 참고)
2. **프로덕션 환경**: 
   - 회원가입 후 이메일 확인
   - 로그인 페이지에서 "인증 이메일 재전송" 버튼 클릭

### 포트 충돌

**증상**: 개발 서버 실행 시 포트가 이미 사용 중

**해결 방법:**
```bash
# 사용 중인 포트 확인
lsof -ti:3001

# 프로세스 종료
kill -9 <PID>

# 또는 vite.config.ts에서 다른 포트로 변경
server: {
  port: 3002,  // 원하는 포트 번호
  host: '0.0.0.0',
}
```

## 📝 개발 가이드

### 코드 스타일
- TypeScript 사용
- 함수 및 변수에 한국어 주석 작성
- DRY 원칙 준수
- 클린 아키텍처 구조

### Git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등
```

## 📄 라이선스

MIT License

## 👥 기여

이슈 및 풀 리퀘스트를 환영합니다!

---

## 🎨 UI 개선 사항 (최신)

### 입주카드 작성 페이지
입주카드 작성 페이지가 완전히 새롭게 디자인되었습니다!

#### 주요 개선 사항
1. **4단계 프로세스**
   - 1단계: 회사 정보 (회사명, 업종)
   - 2단계: 입주 정보 (층수, 호수, 입주일)
   - 3단계: 담당자 정보 (이름, 연락처, 이메일)
   - 4단계: 추가 정보 (직원 수, 주차, 특별 요청)

2. **시각적 진행 표시**
   - 상단에 4단계 진행 바 표시
   - 완료된 단계는 체크 마크로 표시
   - 현재 단계는 강조 표시

3. **향상된 폼 요소**
   - 아이콘이 있는 입력 필드
   - 실시간 유효성 검사
   - 부드러운 애니메이션 효과
   - 명확한 에러 메시지

4. **사용자 경험**
   - 각 단계별 다음/이전 버튼
   - 필수 입력 항목 실시간 확인
   - 자동 완성 (담당자 정보)
   - 도움말 섹션 추가

5. **디자인 요소**
   - 그라데이션 배경
   - 카드 기반 레이아웃
   - Remix Icon 활용
   - 반응형 그리드

**마지막 업데이트**: 2025년 10월 14일

### 민원 관리 시스템
민원 관리 시스템이 추가되었습니다!

#### 주요 기능
1. **사용자 민원 접수**
   - 다양한 카테고리별 민원 접수 (시설, 보안, 소음, 주차 등)
   - 우선순위 설정 (낮음/보통/높음/긴급)
   - 익명 접수 옵션 제공
   - 실시간 민원 상태 확인

2. **관리자 민원 관리**
   - 전체 민원 조회 및 상태별 필터링
   - 민원 답변 작성 기능
   - **처리 상태 변경 기능** (접수됨/처리중/해결됨/종료됨)
   - **악성민원 삭제 기능** (확인 메시지 포함)
   - 우선순위 및 카테고리별 관리
   - 사용자 정보 표시 (익명 제외)

3. **향상된 사용자 경험**
   - 모던한 카드 기반 레이아웃
   - 상태별 색상 구분 (접수됨/처리중/해결됨/종료됨)
   - 답변 모달에 처리 상태 선택 기능 추가
   - 원클릭 상태 변경 버튼
   - 삭제 확인 메시지로 실수 방지

**최신 업데이트**: 2025년 1월 24일

