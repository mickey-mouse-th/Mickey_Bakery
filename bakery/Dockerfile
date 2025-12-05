# ใช้ OpenJDK 20 base image
FROM eclipse-temurin:20-jdk-alpine

# ตั้ง working directory
WORKDIR /app

# copy jar ที่ build แล้ว
COPY target/bakery-0.0.1-SNAPSHOT.jar app.jar

# expose port
EXPOSE 8080

# รัน spring boot
ENTRYPOINT ["java","-jar","app.jar"]
