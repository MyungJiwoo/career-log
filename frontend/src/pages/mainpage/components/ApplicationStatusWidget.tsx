interface ApplicationStatusWidgetProps {
  title: string;
  stats: string;
  total?: number;
  totalUnit?: string;
}

export default function ApplicationStatusWidget({
  title,
  stats,
  total,
  totalUnit,
}: ApplicationStatusWidgetProps) {
  return (
    <div className="w-36 h-36 rounded-2xl bg-white-100 flex flex-col justify-center items-center gap-2">
      <h4 className="text-sm text-black-900">{title}</h4>
      <h3 className="text-black-900 font-bold text-3xl">{stats}</h3>
      {total && totalUnit && (
        <p className="text-sm text-white-700">
          총 {total}회 {totalUnit}
        </p>
      )}
    </div>
  );
}
