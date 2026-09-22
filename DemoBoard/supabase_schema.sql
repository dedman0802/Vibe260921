-- Posts 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- 행 레벨 보안 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 읽을 수 있음
CREATE POLICY "Allow public read access to posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to comments" ON comments
  FOR SELECT USING (true);

-- 정책: 모든 사용자가 쓸 수 있음 (실제 서비스에서는 인증 추가 권장)
CREATE POLICY "Allow public insert on posts" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on comments" ON comments
  FOR INSERT WITH CHECK (true);

-- 정책: 모든 사용자가 삭제 가능 (실제 서비스에서는 소유자만 가능하도록 수정 권장)
CREATE POLICY "Allow public delete on posts" ON posts
  FOR DELETE USING (true);

CREATE POLICY "Allow public delete on comments" ON comments
  FOR DELETE USING (true);

-- 정책: 모든 사용자가 수정 가능 (실제 서비스에서는 소유자만 가능하도록 수정 권장)
CREATE POLICY "Allow public update on posts" ON posts
  FOR UPDATE USING (true) WITH CHECK (true);
