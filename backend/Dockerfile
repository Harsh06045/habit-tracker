# ==========================================
# Stage 1: Build Application with Maven
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

# Copy Maven Wrapper & POM
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Grant execute permissions to wrapper and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# Stage 2: Lightweight JRE Runtime Image
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Add unprivileged user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder stage
COPY --from=builder /workspace/app/target/*.jar app.jar

# Expose default Spring Boot port
EXPOSE 8080

# Environment variables with sensible production defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/auth/health || exit 1

# Start the Spring Boot Application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
