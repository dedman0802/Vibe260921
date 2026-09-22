# Supabase 설정 가이드

DemoBoard가 Supabase를 사용하도록 변경되었습니다. 다음 단계를 따라 설정하세요.

## 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. 새로운 프로젝트를 생성합니다.
3. 프로젝트 설정에서 다음을 확인합니다:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 2단계: 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음을 입력합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3단계: 데이터베이스 테이블 생성

### 방법 1: SQL 스크립트 사용 (권장)

1. Supabase 대시보드에서 "SQL Editor"로 이동합니다.
2. `supabase_schema.sql` 파일의 내용을 복사하여 SQL 에디터에 붙여넣습니다.
3. "Run" 버튼을 클릭하여 테이블을 생성합니다.

### 방법 2: 수동으로 생성

**posts 테이블:**
- id (UUID, Primary Key)
- category (Text)
- title (Text)
- content (Text)
- author (Text)
- created_at (Timestamp with time zone)
- updated_at (Timestamp with time zone)

**comments 테이블:**
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key → posts.id)
- author (Text)
- content (Text)
- created_at (Timestamp with time zone)

## 4단계: 초기 데이터 추가 (선택사항)

Supabase 대시보드의 "Table Editor"에서 다음과 같이 초기 데이터를 추가할 수 있습니다:

```sql
INSERT INTO posts (category, title, content, author, created_at, updated_at)
VALUES 
  ('공지', 'DemoBoard에 오신 것을 환영합니다', 'Next.js, shadcn/ui, TypeScript로 만든 게시판입니다.\n글쓰기, 수정, 삭제, 댓글, 검색, 페이지네이션을 사용해 보세요.', '관리자', now(), now()),
  ('자유', '첫 번째 자유 게시글', '자유롭게 이야기를 나눠 보세요.', '데모유저', now(), now()),
  ('질문', '게시글 데이터는 어디에 저장되나요?', 'Supabase의 PostgreSQL 데이터베이스에 저장됩니다.', '궁금이', now(), now());
```

## 5단계: 애플리케이션 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 애플리케이션을 테스트합니다.

## 변경된 파일

- `src/lib/db.ts`: JSON 파일 기반 → Supabase 기반으로 변경
- `src/lib/supabase.ts`: 새 파일 (Supabase 클라이언트 설정)
- `package.json`: @supabase/supabase-js 라이브러리 추가

## 주의사항

현재 설정은 모든 사용자가 게시글을 생성, 수정, 삭제할 수 있습니다. 
실제 서비스에서는 다음을 고려하세요:

1. **행 레벨 보안(RLS)**: 사용자 인증을 추가하고 정책을 수정합니다.
2. **사용자 식별**: 게시글과 댓글에 사용자 ID를 연결합니다.
3. **접근 제어**: 소유자만 자신의 게시글을 수정/삭제하도록 제한합니다.

## 문제 해결

**"Missing Supabase environment variables" 오류:**
- `.env.local` 파일이 존재하고 올바른 값을 포함하는지 확인합니다.

**데이터베이스 연결 오류:**
- Supabase 프로젝트가 실행 중인지 확인합니다.
- 환경 변수 값이 정확한지 확인합니다.
