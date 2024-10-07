import express from 'express'
import {signup, getMe, login, logout} from "../controllers/auth.controller.js"
import { protectedRoute } from '../middleware/protectRoute.js'

const router = express.Router()
router.get("/me", protectedRoute, getMe)
router.post("/signup", signup)

router.post("/login", login)
router.post("/logout", logout)

export default router