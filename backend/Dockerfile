# 1. Use Eclipse Temurin (The modern standard for Java 17)
FROM eclipse-temurin:17-jdk-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the compiled JAR file into the container
COPY target/*.jar app.jar

# 4. Create a folder for uploads inside the container
RUN mkdir -p uploads

# 5. Expose port 8080
EXPOSE 8080

# 6. Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]