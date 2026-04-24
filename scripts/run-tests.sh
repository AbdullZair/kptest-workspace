#!/bin/bash

# KPTESTPRO Backend Test Runner
# This script runs all backend tests with TestContainers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "========================================"
echo "KPTESTPRO Backend Test Runner"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Navigate to backend directory
cd "$BACKEND_DIR"

echo "Running tests with TestContainers..."
echo ""

# Run tests with Gradle
# TestContainers will automatically start/stop containers
./gradlew clean test --info

# Check test results
TEST_EXIT_CODE=$?

echo ""
echo "========================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✓ All tests passed!"
else
    echo "✗ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

echo "========================================"
echo ""

# Generate coverage report
echo "Generating test coverage report..."
./gradlew jacocoTestReport

echo ""
echo "Coverage report generated at: $BACKEND_DIR/build/reports/jacoco/test/html/index.html"
echo ""

exit $TEST_EXIT_CODE
