// Unit tests never touch a database or Redis: mock at the boundary. Safe defaults only.
process.env.NODE_ENV = "test";
process.env.PAYMENTS_MODE = "simulated";
