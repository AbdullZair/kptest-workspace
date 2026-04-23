FROM python:3.11-alpine

WORKDIR /app

# Install dependencies
RUN pip install flask flask-cors

# Copy mock server code
COPY his_mock.py .

# Expose port
EXPOSE 8081

# Run the mock server
CMD ["python", "his_mock.py"]
