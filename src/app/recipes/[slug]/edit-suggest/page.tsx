export default async function EditSuggestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">수정 제안: {slug}</h1>
      <p className="text-gray-500 mt-2">준비 중입니다. (2단계 기능)</p>
    </main>
  );
}
