# 🧱 1단계: 빌드
FROM gradle:jdk-21-and-23-graal-jammy AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build --no-daemon

# 🚀 2단계: 실행
FROM container-registry.oracle.com/graalvm/jdk:23
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
