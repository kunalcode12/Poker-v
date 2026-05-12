"use client";

export const EMPIRE_REWARD_POINTS = 100;
export const EMPIRE_POINTS_OPERATION = "add";

export const EMPIRE_SESSION_STORAGE_KEYS = {
  wallet: "empire_wallet",
  authToken: "empire_auth_token",
  streamUrl: "empire_stream_url",
  updatedAt: "empire_session_updated_at",
} as const;

export type EmpireSession = {
  wallet: string;
  authToken: string;
  streamUrl: string;
  updatedAt: string;
};

const isBrowser = () => typeof window !== "undefined";

export const getEmpireSession = (): EmpireSession => {
  if (!isBrowser()) {
    return {
      wallet: "",
      authToken: "",
      streamUrl: "",
      updatedAt: "",
    };
  }

  return {
    wallet: localStorage.getItem(EMPIRE_SESSION_STORAGE_KEYS.wallet) ?? "",
    authToken: localStorage.getItem(EMPIRE_SESSION_STORAGE_KEYS.authToken) ?? "",
    streamUrl: localStorage.getItem(EMPIRE_SESSION_STORAGE_KEYS.streamUrl) ?? "",
    updatedAt: localStorage.getItem(EMPIRE_SESSION_STORAGE_KEYS.updatedAt) ?? "",
  };
};

export const persistEmpireSessionFromSearch = (search: string): EmpireSession => {
  if (!isBrowser() || !search) {
    return getEmpireSession();
  }

  const params = new URLSearchParams(search);
  const wallet = params.get("wallet")?.trim();
  const authToken = params.get("authToken")?.trim();
  const streamUrl = params.get("streamUrl")?.trim();

  let updated = false;

  if (wallet) {
    localStorage.setItem(EMPIRE_SESSION_STORAGE_KEYS.wallet, wallet);
    updated = true;
  }

  if (authToken) {
    localStorage.setItem(EMPIRE_SESSION_STORAGE_KEYS.authToken, authToken);
    updated = true;
  }

  if (streamUrl) {
    localStorage.setItem(EMPIRE_SESSION_STORAGE_KEYS.streamUrl, streamUrl);
    updated = true;
  }

  if (updated) {
    localStorage.setItem(EMPIRE_SESSION_STORAGE_KEYS.updatedAt, new Date().toISOString());
  }

  return getEmpireSession();
};

export const updateWinnerPoints = async (
  wallet: string,
  pointsToAward: number = EMPIRE_REWARD_POINTS,
  operation: string = EMPIRE_POINTS_OPERATION,
) => {
  const response = await fetch(
    `https://backend-em-b0an.onrender.com/api/v1/users/${wallet}/points`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points: pointsToAward,
        operation,
      }),
    },
  );

  const data = await response.json();
  console.log(data);

  if (!data.success) {
    throw new Error(data.error || "Failed to update points in backend");
  }

  return data;
};

export const buildGameCenterRedirectUrl = (
  playerWon: boolean,
  pointsEarned: number = EMPIRE_REWARD_POINTS,
) =>
  `https://empireofbits.xyz/?gameWon=${playerWon}&gameName=Poker&pointsEarned=${pointsEarned}`;
