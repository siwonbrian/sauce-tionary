export default async function ReviewWritePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">리뷰·팁 작성: {slug}</h1>
      <p className="text-gray-500 mt-2">준비 중입니다. (2단계 기능)</p>
    </main>
  );
}
