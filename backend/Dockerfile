# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /src

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 파일 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 실행 스테이지
FROM node:20-alpine AS runner

WORKDIR /src

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV PORT=3000

# 필요한 파일만 복사
COPY --from=builder /src/package*.json ./
COPY --from=builder /src/dist ./dist
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/.env ./.env

# uploads 디렉토리 생성
RUN mkdir -p uploads

# 실행 권한 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /src
USER nestjs

# 포트 설정
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]