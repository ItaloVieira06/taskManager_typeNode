import { Router } from "express";
import {createTask, searchTask, updateTask, deleteTask} from "../controller/controller"

const router = Router();

router.post("/", createTask);
router.get("/", searchTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;