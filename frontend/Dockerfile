# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 파일 복사
COPY . .

# Next.js 애플리케이션 빌드
RUN npm run build

# 실행 스테이지
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# 필요한 파일만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

# 실행 권한 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# 포트 설정
EXPOSE 3001

# 애플리케이션 실행
CMD ["npm", "start", "--", "--port", "3001"] 