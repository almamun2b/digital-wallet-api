import { Router } from "express";
import { AuthRoute } from "../modules/auth/auth.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { UserRoute } from "../modules/user/user.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/auth",
    route: AuthRoute,
  },
  {
    path: "/wallet",
    route: WalletRoutes,
  },
  {
    path: "/transaction",
    route: TransactionRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export { router };
