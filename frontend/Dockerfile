# 빌드 스테이지
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /frontend

# 패키지 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 실행 스테이지
FROM node:20-alpine

WORKDIR /frontend

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV PORT=3001

# 필요한 파일들 복사
COPY --from=builder /frontend/package.json ./
COPY --from=builder /frontend/package-lock.json ./
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/public ./public
COPY --from=builder /frontend/next.config.ts ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 포트 설정
EXPOSE 3001

# Next.js 서버 실행
CMD ["npm", "start", "--", "-p", "3001"]