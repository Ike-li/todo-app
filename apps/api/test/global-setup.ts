/**
 * Jest global setup for E2E tests.
 *
 * Sets DATABASE_URL to the test database before any test file is imported.
 * The postgres-test service (from docker-compose.yml) runs on port 5433.
 */
export default function globalSetup(): void {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      'postgresql://todo_user:todo_password@localhost:5433/todo_test';
  }
  // Ensure a JWT_SECRET is available for auth module
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-e2e';
  }
}
