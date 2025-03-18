import React, { useState, useRef, useEffect } from "react";
import { ObjectId, SortOrder } from "mongoose";
import ProductCard from "../productCard/ProductCard";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImageScrollerProps {
  searchQuery?:
    | string
    | {
        [key: string]: SortOrder | { $meta: any };
      }
    | [string, SortOrder][]
    | null;
  chunkSize?: number;
  maximumItems?: number;
  /** If true => horizontal scroller + next/prev. If false => vertical scroller. */
  horizontal?: boolean;
}

const DRAG_THRESHOLD = 5;

const ImageScroller: React.FC<ImageScrollerProps> = ({
  searchQuery,
  chunkSize = 5,
  maximumItems = Infinity,
  horizontal = true
}) => {
  // We'll store items in a Map to avoid duplicates
  const [itemsMap, setItemsMap] = useState<Map<string, IItem>>(new Map());
  const productList = Array.from(itemsMap.values());

  // Pagination / state
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Ref for the container
  const carouselRef = useRef<HTMLDivElement>(null);

  // For horizontal pointer-drag
  const [pointerDown, setPointerDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // If user doesn’t drag horizontally, re-dispatch click
  const clickedElementRef = useRef<HTMLElement | null>(null);

  // For horizontal measurement
  const [itemWidth, setItemWidth] = useState(400);

  // Our fetch function
  const { fn: searchProducts, loading } = useMutation({
    url: "/api/products/getProducts",
    method: "POST"
  });

  // On mount => fetch initial chunk
  useEffect(() => {
    void fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * fetchMore(): get next chunk if hasMore and not at maximum
   */
  async function fetchMore() {
    if (!hasMore || isFetching || productList.length >= maximumItems) return;

    setIsFetching(true);
    try {
      const serverData = await searchProducts({
        sort: searchQuery,
        index: productList.length,
        numToFetch: chunkSize
      });

      if (!Array.isArray(serverData) || serverData.length === 0) {
        // The server returned zero => no more
        setHasMore(false);
        return;
      }

      // Merge items
      const newMap = new Map(itemsMap);
      for (const item of serverData) {
        const idStr = (item._id as ObjectId).toString();
        newMap.set(idStr, item);
      }

      // If we've reached maximum
      if (newMap.size >= maximumItems) {
        setHasMore(false);
      }

      setItemsMap(newMap);
    } catch (err) {
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }

  // Measure item width for horizontal
  useEffect(() => {
    if (!horizontal || !carouselRef.current) return;
    const firstItem = carouselRef.current.querySelector<HTMLElement>(".carousel-item");
    if (firstItem) {
      const rect = firstItem.getBoundingClientRect();
      setItemWidth(rect.width + 16); // e.g. "mx-2" => 16px margin
    }
  }, [productList, horizontal]);

  // If horizontal => block two-finger nav
  useEffect(() => {
    if (!horizontal) return;
    const el = carouselRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      // only horizontal movement
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const el = carouselRef.current;
      if (!el) return;

      const { scrollLeft, clientWidth, scrollWidth } = el;
      const atLeftEdge = scrollLeft <= 0 && e.deltaX < 0;
      const atRightEdge = scrollLeft + clientWidth >= scrollWidth && e.deltaX > 0;
      if (atLeftEdge || atRightEdge) {
        e.preventDefault();
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [horizontal]);

  /**
   * handleScroll:
   * If horizontal => check near the right edge
   * If vertical => check near the bottom
   */
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (horizontal) {
      const pos = el.scrollLeft + el.clientWidth;
      const max = el.scrollWidth;
      // If near right edge => fetch more
      if (max - pos < itemWidth) {
        void fetchMore();
      }
    } else {
      const pos = el.scrollTop + el.clientHeight;
      const max = el.scrollHeight;
      // If near bottom => fetch more
      if (max - pos < 300) {
        void fetchMore();
      }
    }
  }

  // Next => skip partial
  function handleNextClick() {
    if (!carouselRef.current || !horizontal) return;
    const el = carouselRef.current;
    const currentScroll = el.scrollLeft;
    const fraction = currentScroll / itemWidth;

    let nextIndex = Math.ceil(fraction);
    if (Number.isInteger(fraction)) {
      nextIndex = fraction + 1;
    }
    const finalStop = Math.min(nextIndex * itemWidth, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: finalStop, behavior: "smooth" });

    // Possibly fetch
    setTimeout(() => {
      const pos = el.scrollLeft + el.clientWidth;
      const max = el.scrollWidth;
      if (max - pos < itemWidth) {
        void fetchMore();
      }
    }, 300);
  }

  // Prev => skip partial
  function handlePrevClick() {
    if (!carouselRef.current || !horizontal) return;
    const el = carouselRef.current;
    const fraction = el.scrollLeft / itemWidth;
    let prevIndex = Math.floor(fraction);
    if (Number.isInteger(fraction)) {
      prevIndex = fraction - 1;
    }
    if (prevIndex < 0) prevIndex = 0;
    el.scrollTo({ left: prevIndex * itemWidth, behavior: "smooth" });
  }

  // Horizontal pointer drag
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (e.button !== 0) return;
    clickedElementRef.current = e.target as HTMLElement;
    setPointerDown(true);
    setIsDragging(false);
    setStartX(e.clientX);
    setScrollLeft(e.currentTarget.scrollLeft);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (!pointerDown) return;

    const dist = e.clientX - startX;
    if (!isDragging && Math.abs(dist) > DRAG_THRESHOLD) {
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (isDragging) {
      e.preventDefault();
      e.currentTarget.scrollLeft = scrollLeft - dist;
    }
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } else {
      // no drag => pass click
      const el = clickedElementRef.current;
      if (el) {
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(clickEvent);
      }
    }
    setPointerDown(false);
    setIsDragging(false);
    clickedElementRef.current = null;
  }
  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (pointerDown && isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setPointerDown(false);
    setIsDragging(false);
    clickedElementRef.current = null;
  }
  function handleDragStart(e: React.DragEvent) {
    e.preventDefault();
  }

  // Rendering
  return (
    <div className="relative flex w-full flex-col items-center">
      {horizontal ? (
        /* HORIZONTAL MODE */
        <div
          className="relative w-full overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat"
          }}
        >
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onDragStart={handleDragStart}
            className="no-scrollbar relative m-0 flex h-[500px] select-none overflow-x-scroll px-10"
            style={{
              touchAction: "pan-x",
              overscrollBehaviorX: "none",
              overscrollBehaviorY: "none",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              width: "100%"
            }}
          >
            {productList.map(item => (
              <div
                key={(item._id as ObjectId).toString()}
                className="carousel-item mx-2 inline-block min-h-[400px] min-w-[400px]"
                style={{ pointerEvents: "none" }}
              >
                <div style={{ pointerEvents: "auto" }}>
                  <ProductCard
                    name={item.name}
                    id={item._id as ObjectId}
                    image={item.imageLinks?.[0] ?? ""}
                    price={item.price as string}
                    salePrice={item.salePrice as string}
                  />
                </div>
              </div>
            ))}

            {loading && (
              <div className="carousel-item mx-2 inline-block min-h-[400px] min-w-[400px]">
                <div
                  className="flex h-full w-full animate-pulse items-center
      justify-center border border-gray-300 bg-gray-100"
                >
                  <p className="text-gray-500">Loading...</p>
                </div>
              </div>
            )}

            {productList.length >= maximumItems && (
              <Link to="/browse/popular" className="pointer-events-auto">
                <div
                  className="pointer-events-auto mx-2
                    flex min-h-[400px] min-w-[400px] items-center
                    justify-center border border-gray-300 p-4 text-gray-600"
                >
                  <p className="text-lg font-semibold">View More</p>
                </div>
              </Link>
            )}
          </div>

          {/* Prev/Next Buttons */}
          <button
            onClick={handlePrevClick}
            className="absolute left-6 top-[45%] z-50 -translate-y-1/2 transform
                       rounded-full bg-blue-500 p-3 text-white hover:bg-blue-700"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={handleNextClick}
            className="absolute right-6 top-[45%] z-50 -translate-y-1/2 transform
                       rounded-full bg-blue-500 p-3 text-white hover:bg-blue-700"
          >
            <FaChevronRight />
          </button>
        </div>
      ) : (
        /* VERTICAL MODE */
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="no-scrollbar grid h-[calc(100vh-2.5rem)] w-full grid-cols-3 gap-4 overflow-y-scroll p-4 pb-6 pt-5"
        >
          {productList.map(item => (
            <div key={(item._id as ObjectId).toString()} className="carousel-item">
              <ProductCard
                name={item.name}
                id={item._id as ObjectId}
                image={item.imageLinks?.[0] ?? ""}
                price={item.price as string}
                salePrice={item.salePrice as string}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { ImageScroller };
