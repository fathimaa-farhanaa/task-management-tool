import { Router, RequestHandler } from "express";
import { TaskController } from "../controllers/TaskController";

export function createTaskRoutes(
  taskController: TaskController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  // Dashboard overview
  router.get("/dashboard/overview", taskController.getDashboard);

  // Personal tasks
  router.post("/personal", taskController.createPersonal);
  router.get("/personal", taskController.getPersonal);

  // Project tasks
  router.post("/projects/:projectId", taskController.createProjectTask);
  router.get("/projects/:projectId", taskController.getProjectTasks);

  // Task actions
  router.patch("/:id", taskController.updateDetails);
  router.patch("/:id/status", taskController.changeStatus);
  router.patch("/:id/assign", taskController.assign);
  router.patch("/:id/unassign", taskController.unassign);
  router.post("/:id/labels", taskController.addLabel);
  router.delete("/:id/labels/:label", taskController.removeLabel);
  router.delete("/:id", taskController.delete);

  return router;
}
