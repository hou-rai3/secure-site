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
  moodComment: string;
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

const pickMoodComment = (params: Params, score: number) => {
  if (params.status === "SUSPENDED") {
    return "あれ？アカウントが停止状態です。これは本人確認より先に、管理者確認が必要なサインかもしれません。";
  }

  if (params.failedLoginCount7Days >= 3) {
    return `あなたの信用スコアは ${score} 点です。ログイン失敗の痕跡が多めですね。もしかしてあなた...いえ、念のためもう一回確認しましょう！`;
  }

  if (params.failedLoginCount7Days > 0) {
    return `あなたの信用スコアは ${score} 点です。きっと本人なのでしょう！そうですよね？ただ、少しだけ間違ったログインの痕跡があります。`;
  }

  if (score >= 80) {
    return `あなたの信用スコアは ${score} 点です。かなりいい状態です。これはもう、本人らしさがにじみ出ています。`;
  }

  if (score >= 60) {
    return `あなたの信用スコアは ${score} 点です。悪くありません。でも、あと少し整えるともっと本人らしく守れます。`;
  }

  return `あなたの信用スコアは ${score} 点です。あれ？守りが少し薄いようです。もしかしてあなた...いや、まずは落ち着いて確認しましょう！`;
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
    suggestions.push("あと一歩です。12文字以上で、大文字・小文字・数字・記号を全部入れてみましょう。");
  } else {
    items.push({
      label: "パスワード強度",
      points: 0,
      detail: "weak",
    });
    suggestions.push("パスワードが少し素直すぎます。12文字以上で、記号も混ぜて強くしましょう。");
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
    suggestions.push("少しだけログイン失敗の痕跡があります。心当たりがあるか、履歴を確認しましょう。");
  } else {
    items.push({
      label: "直近7日間のログイン失敗",
      points: 0,
      detail: `${params.failedLoginCount7Days}回`,
    });
    suggestions.push("ログイン失敗が多めです。あれ？間違った痕跡がありますよ。履歴をもう一回確認しましょう。");
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
    suggestions.push("ログイン中の場所が複数あります。心当たりのない端末がないか見ておきましょう。");
  } else {
    items.push({
      label: "アクティブセッション",
      points: 0,
      detail: `${params.activeSessionCount}件`,
    });
    suggestions.push("セッション数が気になります。不要なログイン状態はログアウトしましょう。");
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
    suggestions.push("パスワード更新から時間が経っています。そろそろ新しい合言葉にしましょう。");
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
    suggestions.push("アカウントが停止状態です。管理者に状態を確認してください。");
  }

  const total = items.reduce((sum, item) => sum + item.points, 0);
  const score = Math.min(total, 100);

  return {
    score,
    rating: getRating(score),
    moodComment: pickMoodComment(params, score),
    items,
    suggestions: Array.from(new Set(suggestions)),
  };
};
