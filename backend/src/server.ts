import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const production = process.env.NODE_ENV === "production";
const secret = process.env.JWT_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
if (!secret || secret.length < 32)
  throw new Error("Set a random JWT_SECRET of at least 32 characters");
if (!adminEmail || !adminPasswordHash)
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH before starting");
const corsOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "30kb" }));
app.use(cookieParser());
const cookieName = "slush_admin";
const cookieOpts = {
  httpOnly: true,
  secure: production,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};
function authenticated(req: Request) {
  try {
    const claims = jwt.verify(
      req.cookies?.[cookieName] || "",
      secret!,
    ) as jwt.JwtPayload;
    return claims.role === "admin" && claims.sub === adminEmail;
  } catch {
    return false;
  }
}
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!authenticated(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
app.post(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const correctEmail =
      value.email.toLowerCase() === adminEmail!.toLowerCase();
    const correctPassword = await bcrypt.compare(
      value.password,
      adminPasswordHash!,
    );
    if (!correctEmail || !correctPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ role: "admin" }, secret!, {
      subject: adminEmail!,
      expiresIn: "8h",
    });
    res.cookie(cookieName, token, cookieOpts).json({ ok: true });
  },
);
app.get("/api/auth/me", (req, res) =>
  res.json({ authenticated: authenticated(req) }),
);
app.post("/api/auth/logout", (_req, res) =>
  res
    .clearCookie(cookieName, {
      httpOnly: true,
      secure: production,
      sameSite: "lax",
      path: "/",
    })
    .json({ ok: true }),
);
const fields = {
  name: Joi.string().trim().min(2).max(120).required(),
  linkedin: Joi.string()
    .uri({ scheme: ["https"] })
    .pattern(/^https:\/\/(www\.)?linkedin\.com\//i)
    .allow("", null)
    .optional(),
  categories: Joi.array()
    .items(Joi.string().trim().min(1).max(40))
    .max(12)
    .unique()
    .default([]),
  published: Joi.boolean().default(false),
};
const schemas = {
  investors: Joi.object({
    ...fields,
    answer: Joi.string().trim().min(1).max(5000).required(),
    company: Joi.any().strip(),
    project: Joi.any().strip(),
    description: Joi.any().strip(),
  }),
  startups: Joi.object({
    ...fields,
    company: Joi.string().trim().min(1).max(120).required(),
    description: Joi.string().trim().min(1).max(5000).required(),
    answer: Joi.any().strip(),
    project: Joi.any().strip(),
  }),
  builders: Joi.object({
    ...fields,
    project: Joi.string().trim().min(1).max(5000).required(),
    company: Joi.any().strip(),
    answer: Joi.any().strip(),
    description: Joi.any().strip(),
  }),
};
type Kind = keyof typeof schemas;
const models = {
  investors: prisma.investor,
  startups: prisma.startup,
  builders: prisma.builder,
};
// The three Prisma models have different create-input types. API validation ensures each typed payload fits its model.
for (const kind of Object.keys(schemas) as Kind[]) {
  const model = models[kind] as any;
  app.get(`/api/${kind}`, async (req, res, next) => {
    try {
      const all = req.query.all === "1" && authenticated(req);
      const rows = await model.findMany({
        where: all ? {} : { published: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(rows);
    } catch (e) {
      next(e);
    }
  });
  app.post(`/api/${kind}`, requireAdmin, async (req, res, next) => {
    try {
      const { error, value } = schemas[kind].validate(req.body, {
        stripUnknown: true,
      });
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      res
        .status(201)
        .json(
          await model.create({
            data: { ...value, linkedin: value.linkedin || null },
          }),
        );
    } catch (e) {
      next(e);
    }
  });
  app.put(`/api/${kind}/:id`, requireAdmin, async (req, res, next) => {
    try {
      const { error, value } = schemas[kind].validate(req.body, {
        stripUnknown: true,
      });
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      res.json(
        await model.update({
          where: { id: req.params.id },
          data: { ...value, linkedin: value.linkedin || null },
        }),
      );
    } catch (e) {
      next(e);
    }
  });
  app.delete(`/api/${kind}/:id`, requireAdmin, async (req, res, next) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
}
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const code = (err as { code?: string }).code;
  if (code === "P2025") {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
