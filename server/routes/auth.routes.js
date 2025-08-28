import express from "express";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.get("/logout", logout); 

export default authRouter;