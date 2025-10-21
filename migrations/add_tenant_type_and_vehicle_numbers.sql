-- 입주자 유형과 차량번호 컬럼 추가 마이그레이션
-- 실행 전에 Supabase SQL Editor에서 실행하세요

-- 1. tenant_type 컬럼 추가 (입주자 유형: 소유주, 임차인, 기타)
ALTER TABLE move_in_cards 
ADD COLUMN tenant_type TEXT DEFAULT 'tenant' CHECK (tenant_type IN ('owner', 'tenant', 'other'));

-- 2. vehicle_numbers 컬럼 추가 (차량번호 배열)
ALTER TABLE move_in_cards 
ADD COLUMN vehicle_numbers TEXT[] DEFAULT '{}';

-- 3. 기존 데이터에 대한 기본값 설정 (필요한 경우)
-- UPDATE move_in_cards SET tenant_type = 'tenant' WHERE tenant_type IS NULL;
-- UPDATE move_in_cards SET vehicle_numbers = '{}' WHERE vehicle_numbers IS NULL;

-- 4. 컬럼에 NOT NULL 제약 조건 추가 (기본값이 설정된 후)
-- ALTER TABLE move_in_cards ALTER COLUMN tenant_type SET NOT NULL;

-- 5. 인덱스 추가 (성능 향상을 위해)
CREATE INDEX IF NOT EXISTS idx_move_in_cards_tenant_type ON move_in_cards(tenant_type);
CREATE INDEX IF NOT EXISTS idx_move_in_cards_vehicle_numbers ON move_in_cards USING GIN(vehicle_numbers);

-- 6. RLS 정책 확인 (필요한 경우)
-- 기존 RLS 정책이 있다면 새 컬럼들도 포함되도록 확인하세요
