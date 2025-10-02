# 첫 번째 스테이지: 빌드 스테이지
FROM gradle:jdk-21-and-23-graal-jammy AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 래퍼와 설정 파일 먼저 복사
COPY gradle gradle
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle.kts .
COPY settings.gradle.kts .

# 종속성 설치 (캐시 최적화)
RUN gradle dependencies --no-daemon --info

# 소스 코드 복사
COPY src src

# 애플리케이션 빌드 (더 자세한 로그와 함께)
RUN gradle build --no-daemon --info --stacktrace

# 두 번째 스테이지: 실행 스테이지
FROM container-registry.oracle.com/graalvm/jdk:23

# 작업 디렉토리 설정
WORKDIR /app

# 첫 번째 스테이지에서 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 실행할 JAR 파일 지정
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]