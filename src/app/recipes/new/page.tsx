"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPhoto,
  IconSparkles,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { IngredientUnit } from "@/lib/mockRecipes";
import { useLanguage } from "@/lib/LanguageContext";

interface DraftIngredient {
  name: string;
  amount: string;
  unit: IngredientUnit;
}

const UNITS: IngredientUnit[] = ["큰술", "작은술", "ml", "g"];

// 실제 서비스에서는 이 부분이 이미지 인식 AI(Claude API 등) 호출로 바뀝니다.
// 지금은 API 연동 전이라, 사진을 넣으면 이렇게 채워진다는 걸 보여주는 예시 값입니다.
function mockAnalyze(): { name: string; ingredients: DraftIngredient[]; instructions: string } {
  return {
    name: "제보된 소스 (예시)",
    ingredients: [
      { name: "간장", amount: "2", unit: "큰술" },
      { name: "고춧가루", amount: "1", unit: "큰술" },
      { name: "다진마늘", amount: "0.5", unit: "큰술" },
      { name: "설탕", amount: "10", unit: "g" },
    ],
    instructions: "사진에서 읽은 조리 순서가 이 자리에 채워집니다. 실제 내용에 맞게 고쳐주세요.",
  };
}

export default function RecipeSubmitPage() {
  const { t } = useLanguage();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<{
    name: string;
    ingredients: DraftIngredient[];
    instructions: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setDraft(null);
    setSubmitted(false);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // 실제 연동 전이라 잠깐 기다리는 척만 하고 예시 초안을 채웁니다.
    setTimeout(() => {
      setDraft(mockAnalyze());
      setAnalyzing(false);
    }, 1000);
  };

  const updateIngredient = (i: number, patch: Partial<DraftIngredient>) => {
    if (!draft) return;
    const ingredients = draft.ingredients.map((ing, idx) =>
      idx === i ? { ...ing, ...patch } : ing
    );
    setDraft({ ...draft, ingredients });
  };

  const removeIngredient = (i: number) => {
    if (!draft) return;
    setDraft({ ...draft, ingredients: draft.ingredients.filter((_, idx) => idx !== i) });
  };

  const addIngredient = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      ingredients: [...draft.ingredients, { name: "", amount: "", unit: "큰술" }],
    });
  };

  const canAnalyze = Boolean(photoPreview) && sourceUrl.trim() !== "" && !analyzing;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-600">
          <IconArrowLeft size={16} />
          {t.backToList}
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">{t.submitTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.submitSubtitle}</p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-brand-200 bg-brand-100 p-4 text-center">
            <p className="text-sm font-semibold text-brand-700">{t.submitSuccessTitle}</p>
            <p className="mt-1 text-xs text-brand-600">{t.submitSuccessBody}</p>
            <Link href="/" className="mt-3 inline-block text-xs font-medium text-gray-700 underline">
              {t.backToHome}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700">
                {t.submitPhotoLabel} <span className="text-red-500">{t.submitRequired}</span>
              </label>
              <label className="mt-1.5 flex aspect-[4/3] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt={t.submitPhotoAlt}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <IconPhoto size={28} />
                    {t.submitPhotoUploadCta}
                  </span>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <p className="mt-1.5 text-xs text-gray-400">{t.submitPhotoHint}</p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700">
                {t.submitSourceLabel} <span className="text-red-500">{t.submitRequired}</span>
              </label>
              <p className="mt-0.5 text-xs text-gray-400">{t.submitSourceHint}</p>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder={t.submitSourcePlaceholder}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              <IconSparkles size={16} />
              {analyzing ? t.submitAnalyzing : t.submitAnalyzeCta}
            </button>
            {!photoPreview || !sourceUrl.trim() ? (
              <p className="mt-1.5 text-center text-xs text-gray-400">{t.submitAnalyzeWarning}</p>
            ) : null}

            {draft && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs text-gray-400">{t.submitAiReadNote}</p>

                <label className="block text-sm font-semibold text-gray-700">{t.submitNameLabel}</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />

                <label className="mt-4 block text-sm font-semibold text-gray-700">{t.submitIngredientsLabel}</label>
                <div className="mt-1.5 space-y-2">
                  {draft.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        value={ing.name}
                        onChange={(e) => updateIngredient(i, { name: e.target.value })}
                        placeholder={t.submitIngredientNamePlaceholder}
                        className="w-1/3 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                      />
                      <input
                        value={ing.amount}
                        onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                        placeholder={t.submitIngredientAmountPlaceholder}
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(i, { unit: e.target.value as IngredientUnit })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeIngredient(i)}
                        aria-label={t.submitRemoveIngredient}
                        className="ml-auto text-gray-300 hover:text-red-500"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addIngredient}
                  className="mt-2 flex items-center gap-1 text-xs text-brand-600"
                >
                  <IconPlus size={14} />
                  {t.submitAddIngredient}
                </button>

                <label className="mt-4 block text-sm font-semibold text-gray-700">{t.submitInstructionsLabel}</label>
                <textarea
                  value={draft.instructions}
                  onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-brand-400"
                />

                <button
                  onClick={() => setSubmitted(true)}
                  className="mt-4 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white"
                >
                  {t.submitButton}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
