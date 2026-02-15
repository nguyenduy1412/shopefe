import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const SkeletonLoader = ({
  count = 1,
  height,
  width,
}: {
  count?: number;
  height?: string | number;
  width?: string | number;
}) => {
  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <Skeleton count={count} height={height} width={width} />
    </SkeletonTheme>
  );
};
