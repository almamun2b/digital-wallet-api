import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import {
  createUserZodScheme,
  manageAgentZodSchema,
  updateUserZodSchema,
} from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodScheme),
  UserController.createUser
);
router.get(
  "/all-users",
  checkAuth(...Object.values(Role)),
  UserController.getAllUser
);
router.get(
  "/all-agents",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.getAllAgents
);
router.get(
  "/me",
  checkAuth(...Object.values(Role)),
  UserController.getMyProfile
);
router.post(
  "/apply-for-agent",
  checkAuth(Role.USER),
  UserController.applyForAgent
);
router.post(
  "/manage-agent/:userId",
  validateRequest(manageAgentZodSchema),
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.approveAgent
);
router.patch(
  "/update-profile",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updateUser
);

export const UserRoute = router;
