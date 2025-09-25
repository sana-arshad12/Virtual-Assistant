import express from 'express'
import { executeSystemCommand } from '../controllers/system.controller.js'

const router = express.Router()

// POST /api/system/execute - Execute system command
router.post('/execute', executeSystemCommand)

export default router
