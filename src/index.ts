import express, { type Request, type Response, type NextFunction } from "express";

const app = express();

app.use((req, res, next) => {
    const start = Date.now();
    const time = new Date(start).toISOString().slice(0, 19);

    res.once("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[${time}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
        );
    });

    next();
});

function auth(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization !== "Bearer secret-token") {
        res.status(401).send("Unauthorized");
        return;
    }

    next();
}

function validateUser(req: Request, res: Response, next: NextFunction) {
    const { name, age, email } = req.body ?? {};

    if (typeof name !== "string" || name.trim().length < 2) {
        res.status(400).send("Invalid name");
        return;
    }

    if (typeof age !== "number" || !Number.isFinite(age) || age < 0 || age > 120) {
        res.status(400).send("Invalid age");
        return;
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).send("Invalid email");
        return;
    }

    next();
}

app.get("/api/data", auth, (_req, res) => {
    res.json({ message: "Secret data" });
});

app.post("/api/users", auth, express.json(), validateUser, (req, res) => {
    res.status(201).json({ message: "User created", user: req.body });
});

app.get("/public/info", (_req, res) => {
    res.json({ message: "Public info" });
});

app.listen(3000, "127.0.0.1", () => {
    console.log("Server running at http://127.0.0.1:3000");
});