import { Router, RequestHandler } from "express";
import { ProjectController } from "../controllers/ProjectController";

export function createProjectRoutes(
  projectController: ProjectController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post("/", projectController.create);
  router.get("/", projectController.getUserProjects);
  router.get("/:id", projectController.getById);
  router.patch("/:id", projectController.update);
  router.delete("/:id", projectController.delete);

  // Members management
  router.post("/:id/members", projectController.addMember);
  router.delete("/:id/members/:userId", projectController.removeMember);
  router.post("/:id/transfer-host", projectController.transferOwnership);
  router.patch("/:id/members/:userId/label", projectController.setResponsibility);

  return router;
}
