# ใช้ OpenJDK 21 base image
FROM eclipse-temurin:21-jdk-alpine

# ตั้ง working directory ใน container
WORKDIR /app

# คัดลอกไฟล์ JAR ที่ build แล้วลง container
COPY target/bakery-0.0.1-SNAPSHOT.jar app.jar

# ถ้ามีไฟล์ .env ก็ copy ลงด้วย (ไม่บังคับ ถ้าใช้ Render Environment Variables)
# COPY .env .env

# Expose port ตาม application.properties
EXPOSE 8080

# คำสั่ง run Spring Boot app
ENTRYPOINT ["java","-jar","app.jar"]
