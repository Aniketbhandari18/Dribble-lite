import { useCallback, useRef } from "react";

const useInfiniteScroll = (
  isLoading: boolean,
  hasMore: boolean,
  onLoadMore: () => void,
  options?: { root?: Element | null; rootMargin?: string; threshold?: number }
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { root = null, rootMargin = "0px", threshold = 0 } = options ?? {};

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || !hasMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { root, rootMargin, threshold }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore]
  );

  return lastElementRef;
};

export default useInfiniteScroll;