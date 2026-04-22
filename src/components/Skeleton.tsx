import React from "react";
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  style,
}) => <div className={`skeleton-block ${className}`} style={style} />;

export const SkeletonStatCard: React.FC = () => (
  <div className="skeleton-stat-card">
    <div className="skeleton-stat-body">
      <div className="skeleton-stat-left">
        <Skeleton
          style={{ width: "60%", height: "14px", marginBottom: "10px" }}
        />
        <Skeleton style={{ width: "80%", height: "20px" }} />
      </div>
      <Skeleton
        style={{ width: "48px", height: "48px", borderRadius: "12px" }}
      />
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="skeleton-chart-wrapper">
    <div className="skeleton-chart-header">
      <div>
        <Skeleton
          style={{ width: "160px", height: "16px", marginBottom: "8px" }}
        />
        <Skeleton style={{ width: "120px", height: "12px" }} />
      </div>
      <Skeleton
        style={{ width: "80px", height: "36px", borderRadius: "8px" }}
      />
    </div>
    <Skeleton
      style={{
        width: "100%",
        height: "360px",
        borderRadius: "8px",
        marginTop: "24px",
      }}
    />
    <div className="skeleton-chart-footer">
      <Skeleton style={{ width: "160px", height: "14px" }} />
      <Skeleton style={{ width: "120px", height: "14px" }} />
    </div>
  </div>
);

export const SkeletonProductCard: React.FC = () => (
  <div className="col l-2-9 m-3-9 c-5-9">
    <div className="skeleton-product-card">
      <Skeleton
        style={{ width: "100%", aspectRatio: "1/1", borderRadius: "8px" }}
      />
      <Skeleton style={{ width: "85%", height: "14px", marginTop: "12px" }} />
      <Skeleton style={{ width: "55%", height: "14px", marginTop: "8px" }} />
      <Skeleton style={{ width: "40%", height: "12px", marginTop: "6px" }} />
    </div>
  </div>
);

export const SkeletonProductGrid: React.FC = () => (
  <div className="row container__newitem m-16 m-32">
    {Array.from({ length: 12 }).map((_, i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
);

export const skeletonStyles = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .skeleton-block {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 6px;
    display: block;
  }

  .skeleton-stat-card {
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    padding: 16px;
    margin-bottom: 16px;
  }

  .skeleton-stat-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .skeleton-stat-left {
    flex: 1;
  }

  .skeleton-chart-wrapper {
    padding: 24px;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .skeleton-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .skeleton-chart-footer {
    display: flex;
    gap: 40px;
    margin-top: 24px;
  }

  .skeleton-product-card {
    padding: 8px;
  }
`;
