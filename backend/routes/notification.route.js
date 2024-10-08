import express from 'express'
import { protectedRoute } from '../middleware/protectRoute.js'
import { deleteNotifications, getNotifications } from '../controllers/notification.controller.js'

const router = express.Router()

router.get("/", protectedRoute, getNotifications)
router.delete("/", protectedRoute, deleteNotifications)
export default router