// Defaults match docker-compose.yml and the CI service containers. CI overrides via env.
process.env.NODE_ENV = "test";
process.env.PAYMENTS_MODE = "simulated";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/afritrade_test?schema=public";
process.env.REDIS_URL ??= "redis://localhost:6379/1";
process.env.JWT_ACCESS_SECRET ??=
  "integration-test-secret-minimum-32-characters-0000";
