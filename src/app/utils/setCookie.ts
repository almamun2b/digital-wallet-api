import { Response } from "express";

interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (!tokenInfo.accessToken || !tokenInfo.refreshToken) {
    throw new Error("Token is missing");
  }

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 86400000,
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 2592000000,
    });
  }
};

export { setAuthCookie };
