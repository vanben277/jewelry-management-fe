import { SkeletonProductGrid } from "./Skeleton";

export const Loading = ({ type = "spinner" }: { type?: "spinner" | "skeleton" }) => {
  if (type === "skeleton") return <SkeletonProductGrid />;
  return (
    <div className="flex justify-center items-center p-10">
      <div className="spinner-border" role="status">
        <span className="sr-only">Đang tải...</span>
      </div>
    </div>
  );
};