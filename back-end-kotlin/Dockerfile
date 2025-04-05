FROM amazoncorretto:21
LABEL authors="ahoodyakov"

# Set the working directory in the container
WORKDIR /app

# Copy the executable JAR file into the container at /app
COPY build/libs/back-end-kotlin-0.0.1-SNAPSHOT.jar app.jar

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java","-jar","/app/app.jar"]
