#!/bin/bash

# Code Quality Test Script
# Tests the professional code quality improvements

set -e

echo "🧪 Testing Code Quality Improvements..."

# Check for console.log statements
echo "=== Checking for console.log statements ==="
console_log_count=0
for service in user-service product-service order-service notification-service; do
  count=$(grep -c "console\.log" apps/$service/server.js 2>/dev/null || echo "0")
  console_log_count=$((console_log_count + count))
  if [ "$count" -gt 0 ]; then
    echo "❌ $service: $count console.log statements found"
  else
    echo "✅ $service: No console.log statements"
  fi
done

if [ "$console_log_count" -eq 0 ]; then
  echo "✅ All services: No console.log statements found"
else
  echo "❌ Total console.log statements: $console_log_count"
fi

# Check for winston logger usage
echo ""
echo "=== Checking for professional logging ==="
for service in user-service product-service order-service notification-service; do
  if grep -q "winston" apps/$service/server.js; then
    echo "✅ $service: Using winston logger"
  else
    echo "❌ $service: Not using winston logger"
  fi
done

# Check for error handling
echo ""
echo "=== Checking for error handling ==="
for service in user-service product-service order-service notification-service; do
  if grep -q "try.*catch\|\.catch" apps/$service/server.js; then
    echo "✅ $service: Has error handling"
  else
    echo "⚠️  $service: Limited error handling"
  fi
done

# Check for environment validation
echo ""
echo "=== Checking for environment validation ==="
for service in user-service product-service order-service notification-service; do
  if grep -q "requiredEnvVars\|process\.env" apps/$service/server.js; then
    echo "✅ $service: Has environment validation"
  else
    echo "⚠️  $service: No environment validation"
  fi
done

# Test service startup
echo ""
echo "=== Testing service startup ==="
for service in user-service product-service; do
  echo "Testing $service startup..."
  timeout 3s node apps/$service/server.js > /dev/null 2>&1 && echo "✅ $service: Starts successfully" || echo "❌ $service: Failed to start"
done

echo ""
echo "🎉 Code quality test complete!"
