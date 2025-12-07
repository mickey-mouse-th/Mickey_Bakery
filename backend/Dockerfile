FROM maven:3.9.6-eclipse-temurin-21 AS build

# FORCE REBUILD
ENV CACHE_BUSTER=20251208

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -DskipTests package

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
