# Step 1: Use Maven to build the application
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
# Copy your pom.xml and source code into the container
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests to save time
RUN mvn clean package -DskipTests

# Step 2: Create a lightweight runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the built .jar file from the previous step
COPY --from=build /app/target/*.jar app.jar
# Expose the port Spring Boot uses
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]