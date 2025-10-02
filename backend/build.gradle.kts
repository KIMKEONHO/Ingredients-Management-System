plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
// Spring Boot 기본 의존성
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security") // security
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("ognl:ognl:3.2.21")


    // redis
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.session:spring-session-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // 개발 및 실행환경 관련
    developmentOnly("org.springframework.boot:spring-boot-devtools")
//    developmentOnly("org.springframework.boot:spring-boot-docker-compose")

    // DB
    runtimeOnly("com.mysql:mysql-connector-j")
    runtimeOnly("com.h2database:h2")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
//    testImplementation("org.testcontainers:mysql:1.19.3")
    testImplementation("org.testcontainers:junit-jupiter:1.19.3")
    testImplementation("org.springframework.security:spring-security-test")

    // OpenAPI
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6")

    // JSON 처리
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.google.code.gson:gson")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // QueryDSL (JPA 동적 쿼리 빌더)
//    implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
//    annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")
//    annotationProcessor("jakarta.annotation:jakarta.annotation-api")
//    annotationProcessor("jakarta.persistence:jakarta.persistence-api")

    // 외부 라이브러리
//    implementation("net.nurigo:sdk:4.2.7") // 누리고 SDK
//    implementation("org.jsoup:jsoup:1.17.2")
//    implementation("org.springframework.cloud:spring-cloud-starter-aws:2.2.6.RELEASE")

    // Kotlin 지원
//    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // STOMP
//    implementation("org.springframework.boot:spring-boot-starter-websocket")
//    implementation("org.springframework.boot:spring-boot-starter-webflux")
//    implementation("org.springframework.boot:spring-boot-starter-aop")
//    implementation("org.springframework.boot:spring-boot-starter-cache")

    // Apache POI for Excel export - 추가된 부분
//    implementation("org.apache.poi:poi:5.2.3")
//    implementation("org.apache.poi:poi-ooxml:5.2.3")

    // AWS
    implementation(platform("software.amazon.awssdk:bom:2.24.0"))
    implementation("software.amazon.awssdk:s3")
}

tasks.test {
    useJUnitPlatform()
}
