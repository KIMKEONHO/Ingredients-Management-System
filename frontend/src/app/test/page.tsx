import React from "react";

type StorageMethod = "냉장" | "실온" | "냉동";
type ItemStatus = "보관중" | "폐기" | "곧만료";

interface IngredientItem {
  id: number;
  name: string;
  category: string;
  amount: string;
  storage: StorageMethod;
  expiry: string; // YYYY-MM-DD
  addedAt: string; // YYYY-MM-DD
  status: ItemStatus;
}

const items: IngredientItem[] = [
  {
    id: 1,
    name: "토마토",
    category: "채소",
    amount: "400 g",
    storage: "냉장",
    expiry: "2024-01-25",
    addedAt: "2024-01-20",
    status: "폐기",
  },
  {
    id: 2,
    name: "브로콜리",
    category: "채소",
    amount: "300 g",
    storage: "냉장",
    expiry: "2024-01-26",
    addedAt: "2024-01-23",
    status: "보관중",
  },
  {
    id: 3,
    name: "바나나",
    category: "과일",
    amount: "6 개",
    storage: "실온",
    expiry: "2024-01-27",
    addedAt: "2024-01-24",
    status: "보관중",
  },
  {
    id: 4,
    name: "우유",
    category: "유제품",
    amount: "1 L",
    storage: "냉장",
    expiry: "2024-01-28",
    addedAt: "2024-01-22",
    status: "보관중",
  },
  {
    id: 5,
    name: "닭가슴살",
    category: "육류",
    amount: "500 g",
    storage: "냉장",
    expiry: "2024-01-30",
    addedAt: "2024-01-20",
    status: "보관중",
  },
  {
    id: 6,
    name: "달걀",
    category: "축산물",
    amount: "12 개",
    storage: "냉장",
    expiry: "2024-02-10",
    addedAt: "2024-01-18",
    status: "보관중",
  },
];

function statusBadgeStyles(status: ItemStatus) {
  switch (status) {
    case "보관중":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "폐기":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "곧만료":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function storageBadgeStyles(storage: StorageMethod) {
  switch (storage) {
    case "냉장":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "실온":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "냉동":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* 상단 헤더 */}
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 식재료 재고</h1>
        <p className="mt-1 text-sm text-gray-500">
          보유한 식재료를 효율적으로 관리하세요.
        </p>
      </section>

      {/* 요약 카드 */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "전체 식재료", value: 8, iconBg: "bg-indigo-50", icon: "📦" },
          { label: "보관 중", value: 7, iconBg: "bg-emerald-50", icon: "✅" },
          { label: "곧 만료", value: 0, iconBg: "bg-amber-50", icon: "⏰" },
          { label: "폐기됨", value: 1, iconBg: "bg-rose-50", icon: "🗑️" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${card.iconBg}`}
              >
                <span className="text-lg">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 검색/필터 바 */}
      <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="sr-only">식재료 검색</label>
            <div className="relative">
              <input
                type="text"
                placeholder="식재료 검색..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-gray-400"
              />
              <svg
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-3.5-3.5" />
              </svg>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2">
            {[
              { label: "분류", options: ["전체", "채소", "과일", "육류"] },
              { label: "보관", options: ["전체", "냉장", "실온", "냉동"] },
              { label: "정렬", options: ["유통기한순", "추가일순", "이름순"] },
            ].map((sel) => (
              <select
                key={sel.label}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm"
                defaultValue={sel.options[0]}
              >
                {sel.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            + 식재료 추가
          </button>
        </div>
      </section>

      {/* 테이블 */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                식재료명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                수량
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                보관방법
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                유통기한
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                추가일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      🌿
                    </span>
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">{it.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{it.amount}</td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${storageBadgeStyles(
                      it.storage
                    )}`}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-current/60" />
                    {it.storage}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div>
                    <div className="font-medium text-gray-900">{it.expiry}</div>
                    <div className="mt-1 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[11px] text-rose-600 ring-1 ring-rose-200">
                      만료됨
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{it.addedAt}</td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles(
                      it.status
                    )}`}
                  >
                    {it.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3 text-gray-400">
                    {/* edit icon */}
                    <button
                      aria-label="edit"
                      className="transition-colors hover:text-emerald-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L8.982 17.73a4.5 4.5 0 0 1-1.89 1.123l-3.042.912a.75.75 0 0 1-.93-.93l.912-3.042a4.5 4.5 0 0 1 1.123-1.89L16.862 3.487Z" />
                        <path d="M19.5 10.5 13.5 4.5" />
                      </svg>
                    </button>
                    {/* delete icon */}
                    <button
                      aria-label="delete"
                      className="transition-colors hover:text-rose-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V5h4.25a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4.75 5H9V3.75Z" />
                        <path d="M6.75 7h10.5l-.7 12.04A2.25 2.25 0 0 1 14.31 21H9.69a2.25 2.25 0 0 1-2.24-1.96L6.75 7Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

