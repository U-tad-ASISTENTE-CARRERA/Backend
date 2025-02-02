const request = require("supertest");
const app = require("../app");
const { db } = require("../config/firebase");

let adminToken, studentToken, testUserId;

beforeAll(async () => {
  const adminRes = await request(app).post("/login").send({
    email: "admin@example.com",
    password: "AdminPass123",
  });
  adminToken = adminRes.body.token;

  const studentRes = await request(app).post("/login").send({
    email: "student@example.com",
    password: "StudentPass123",
  });
  studentToken = studentRes.body.token;
});

describe("User API Endpoints", () => {
  test("Admin should create a new user", async () => {
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "TestPass123",
        role: "STUDENT",
        metadata: { academicHistory: {} },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    testUserId = res.body.user.id;
  });

  test("Admin should get user by ID", async () => {
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("testuser@example.com");
  });

  test("Student should update academic history", async () => {
    const res = await request(app)
      .patch(`/users/${testUserId}/academicHistory`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        subject: "Math",
        grade: 8.5,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedHistory.Math).toBe(8.5);
  });

  test("Student should get career recommendations", async () => {
    const res = await request(app)
      .get(`/users/${testUserId}/recommendations`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  test("Admin should delete user", async () => {
    const res = await request(app)
      .delete(`/users/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await db.collection("users").doc(testUserId).delete();
});