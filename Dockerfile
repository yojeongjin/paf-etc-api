FROM node:latest

# 앱이 들어갈 디렉토리
WORKDIR /usr/src/app

# package.json 복사 후 설치
COPY package*.json ./
RUN npm install

# 전체 앱 코드 복사
COPY . .

# 앱이 사용하는 포트
EXPOSE 5000

# 앱 실행
CMD ["npm", "start"]
