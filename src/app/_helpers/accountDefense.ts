import type { PasswordStrength } from "@/app/_types/CommonSchemas";

export type DefenseRating = "Excellent" | "Good" | "Needs Attention" | "Weak";

export type DefenseScoreItem = {
  label: string;
  points: number;
  detail: string;
};

export type AccountDefenseLevel = {
  score: number;
  rating: DefenseRating;
  items: DefenseScoreItem[];
  suggestions: string[];
};

type Params = {
  passwordStrength: PasswordStrength;
  failedLoginCount7Days: number;
  activeSessionCount: number;
  passwordUpdatedAt: Date;
  status: "ACTIVE" | "SUSPENDED";
  now: Date;
};

const getRating = (score: number): DefenseRating => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Attention";
  return "Weak";
};

export const calculateAccountDefenseLevel = (
  params: Params,
): AccountDefenseLevel => {
  const items: DefenseScoreItem[] = [];
  const suggestions: string[] = [];
  const passwordAgeDays = Math.floor(
    (params.now.getTime() - params.passwordUpdatedAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (params.passwordStrength === "strong") {
    items.push({
      label: "パスワード強度",
      points: 25,
      detail: "strong",
    });
  } else if (params.passwordStrength === "medium") {
    items.push({
      label: "パスワード強度",
      points: 15,
      detail: "medium",
    });
    suggestions.push("パスワードを12文字以上に変更する");
    suggestions.push("英大文字・英小文字・数字・記号をすべて含める");
  } else {
    items.push({
      label: "パスワード強度",
      points: 0,
      detail: "weak",
    });
    suggestions.push("パスワードを12文字以上に変更する");
    suggestions.push("英大文字・英小文字・数字・記号を含める");
  }

  if (params.failedLoginCount7Days === 0) {
    items.push({
      label: "直近7日間のログイン失敗",
      points: 20,
      detail: "失敗なし",
    });
  } else if (params.failedLoginCount7Days <= 2) {
    items.push({
      label: "直近7日間のログイン失敗",
      points: 10,
      detail: `${params.failedLoginCount7Days}回`,
    });
    suggestions.push("ログイン履歴に心当たりのない試行がないか確認する");
  } else {
    items.push({
      label: "直近7日間のログイン失敗",
      points: 0,
      detail: `${params.failedLoginCount7Days}回`,
    });
    suggestions.push("ログイン履歴に心当たりのない試行がないか確認する");
  }

  items.push({
    label: "ログイン履歴の確認",
    points: 10,
    detail: "確認可能",
  });

  if (params.activeSessionCount === 1) {
    items.push({
      label: "アクティブセッション",
      points: 15,
      detail: "1件",
    });
  } else if (params.activeSessionCount >= 2 && params.activeSessionCount <= 3) {
    items.push({
      label: "アクティブセッション",
      points: 8,
      detail: `${params.activeSessionCount}件`,
    });
    suggestions.push("不要なセッションをログアウトする");
  } else {
    items.push({
      label: "アクティブセッション",
      points: 0,
      detail: `${params.activeSessionCount}件`,
    });
    suggestions.push("不要なセッションをログアウトする");
  }

  if (passwordAgeDays <= 30) {
    items.push({
      label: "パスワード更新",
      points: 15,
      detail: `${passwordAgeDays}日前`,
    });
  } else {
    items.push({
      label: "パスワード更新",
      points: 0,
      detail: `${passwordAgeDays}日前`,
    });
    suggestions.push("パスワードを定期的に変更する");
  }

  if (params.status === "ACTIVE") {
    items.push({
      label: "アカウント状態",
      points: 15,
      detail: "active",
    });
  } else {
    items.push({
      label: "アカウント状態",
      points: 0,
      detail: "suspended",
    });
    suggestions.push("アカウント状態を確認する");
  }

  const total = items.reduce((sum, item) => sum + item.points, 0);
  const score = Math.min(total, 100);

  return {
    score,
    rating: getRating(score),
    items,
    suggestions: Array.from(new Set(suggestions)),
  };
};
