import React, { useState, useRef, useEffect, useCallback } from "react";
import { ObjectId, SortOrder } from "mongoose";
import ProductCard from "../productCard/ProductCard";
import { useMutation } from "../../hooks/useMutation";
import { IItem } from "../../db/models/item";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { sortToPath } from "../../pages/browse/Browse";

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

  // Control infinite loading
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Main ref to the scroller wrapper (or vertical container)
  const carouselRef = useRef<HTMLDivElement>(null);

  // Horizontal dragging state
  const [pointerDown, setPointerDown] = useState(false);
  const isDraggingRef = useRef(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const pageScrollTopRef = useRef(0);

  // Item width (for horizontal scroller)
  const [itemWidth, setItemWidth] = useState(400);

  // Data loading function
  const { fn: searchProducts, loading } = useMutation({
    url: "/api/products/getProducts",
    method: "POST"
  });

  // -------------------------------------------------------------------------
  // 1) fetchMore with stable reference
  // -------------------------------------------------------------------------
  const fetchMore = useCallback(async () => {
    // Don’t fetch if we’re done or already fetching
    if (!hasMore || isFetching || productList.length >= maximumItems) return;

    setIsFetching(true);
    try {
      const serverData = await searchProducts({
        sort: searchQuery,
        index: productList.length,
        numToFetch: chunkSize
      });

      if (!Array.isArray(serverData) || serverData.length === 0) {
        setHasMore(false);
        return;
      }

      const newMap = new Map(itemsMap);
      for (const item of serverData) {
        // Use string version of _id as the key
        const idStr = String(item._id);
        newMap.set(idStr, item);
      }

      // If we reach maximum
      if (newMap.size >= maximumItems) {
        setHasMore(false);
      }
      setItemsMap(newMap);
    } catch (error) {
      console.error(error);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }, [hasMore, isFetching, productList.length, maximumItems, searchProducts, searchQuery, chunkSize, itemsMap]);

  // -------------------------------------------------------------------------
  // 2) Load first batch on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    void fetchMore();
  }, [fetchMore]);

  // -------------------------------------------------------------------------
  // 3) Global mousemove => dynamic cursor
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const wrapper = carouselRef.current;
      if (!wrapper) return;

      if (pointerDown) {
        // If we’re dragging => "grabbing"
        wrapper.style.cursor = "grabbing";
      } else {
        // If hovered over .carousel-item => pointer
        const hoveredEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (hoveredEl && (hoveredEl.classList.contains("carousel-item") || hoveredEl.closest(".carousel-item"))) {
          wrapper.style.cursor = "pointer";
        } else {
          // horizontal => "grab", vertical => "default"
          wrapper.style.cursor = horizontal ? "grab" : "default";
        }
      }
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [pointerDown, horizontal]);

  // -------------------------------------------------------------------------
  // (A) If horizontal, measure item width for scroller
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!horizontal || !carouselRef.current) return;
    const firstItem = carouselRef.current.querySelector<HTMLElement>(".carousel-item");
    if (firstItem) {
      const style = window.getComputedStyle(firstItem);
      const marginLeft = parseFloat(style.marginLeft) || 0;
      const marginRight = parseFloat(style.marginRight) || 0;
      let totalWidth = firstItem.offsetWidth;
      totalWidth += marginLeft + marginRight;
      setItemWidth(totalWidth);
    }
  }, [productList, horizontal]);

  // -------------------------------------------------------------------------
  // (B) Horizontal trackpad scroll
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!horizontal) return;
    const el = carouselRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      const scroller = e.currentTarget as HTMLElement;
      // Let vertical scroll go to the page container
      const pageContent = document.getElementById("root")?.children[1] as HTMLElement | null;

      if (pageContent && e.deltaY !== 0) {
        pageContent.scrollTop += e.deltaY;
      }
      // For horizontal deltas => prevent default & scroll manually
      if (e.deltaX !== 0) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaX;
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [horizontal]);

  // -------------------------------------------------------------------------
  // (C) Horizontal infinite load near the end
  // -------------------------------------------------------------------------
  function handleHorizontalScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const pos = el.scrollLeft + el.clientWidth;
    const max = el.scrollWidth;
    if (max - pos < itemWidth) {
      void fetchMore();
    }
  }

  // -------------------------------------------------------------------------
  // (D) Horizontal next/prev arrows
  // -------------------------------------------------------------------------
  function handleNextClick() {
    if (!carouselRef.current || !horizontal) return;
    const el = carouselRef.current;
    const currentIndex = Math.round(el.scrollLeft / itemWidth);
    const nextIndex = currentIndex + 1;
    const finalStop = Math.min(nextIndex * itemWidth, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: finalStop, behavior: "smooth" });

    setTimeout(() => {
      const pos = el.scrollLeft + el.clientWidth;
      const max = el.scrollWidth;
      if (max - pos < itemWidth) {
        void fetchMore();
      }
    }, 300);
  }

  function handlePrevClick() {
    if (!carouselRef.current || !horizontal) return;
    const el = carouselRef.current;
    const currentIndex = Math.round(el.scrollLeft / itemWidth);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const finalStop = Math.max(prevIndex * itemWidth, 0);
    el.scrollTo({ left: finalStop, behavior: "smooth" });
  }

  // -------------------------------------------------------------------------
  // (E) Horizontal pointer drag logic
  // -------------------------------------------------------------------------
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (e.button !== 0) return;

    setPointerDown(true);
    isDraggingRef.current = false;
    setStartX(e.clientX);
    setStartY(e.clientY);
    setScrollLeft(e.currentTarget.scrollLeft);

    const pageContent = document.getElementById("root")?.children[1] as HTMLElement | null;
    pageScrollTopRef.current = pageContent?.scrollTop ?? 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal || !pointerDown) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const distance = Math.abs(dx) + Math.abs(dy);

    // If we exceed threshold => dragging
    if (!isDraggingRef.current && distance > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
    }

    // If dragging => decide axis
    if (isDraggingRef.current) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // mostly horizontal
        e.preventDefault();
        e.currentTarget.scrollLeft = scrollLeft - dx;
      }
      // else => let vertical pass
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;

    // If not dragged => treat as a tap
    if (!isDraggingRef.current) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      console.log(el);
      if (el) {
        // If user directly tapped an <a>, let normal browser click happen
        if (el.tagName === "A") {
          // Do nothing => default link navigation
        } else {
          // Otherwise, see if there's an <a> inside
          let link = el.querySelector("a") as HTMLAnchorElement | null;

          if (!link) {
            // If not, see if there's a parent <a>
            link = el.closest("a") as HTMLAnchorElement | null;
          }

          if (link) link.click();
        }
      }
    }

    e.currentTarget.releasePointerCapture(e.pointerId);
    setPointerDown(false);
    isDraggingRef.current = false;
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (pointerDown && isDraggingRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setPointerDown(false);
    isDraggingRef.current = false;
  }

  function handleDragStart(e: React.DragEvent) {
    e.preventDefault(); // prevent image-drag
  }

  // -------------------------------------------------------------------------
  // (F) Vertical: watch window scroll; doc click but only if inside scroller
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!horizontal) {
      const handleWindowScroll = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;
        if (fullHeight - (scrollY + viewportHeight) < 300) {
          void fetchMore();
        }
      };

      window.addEventListener("scroll", handleWindowScroll);

      // Only intercept clicks that occur inside the scroller.
      const handleDocClick = (e: MouseEvent) => {
        if (!carouselRef.current) return;

        // Figure out where the user clicked
        const clickedEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (!clickedEl) return;

        // If the scroller doesn't contain the clickedEl => do nothing
        if (!carouselRef.current.contains(clickedEl)) {
          return; // let normal links (like navbar) work
        }

        // Within scroller => see if there's an anchor
        if (clickedEl.tagName === "A") {
          // If directly an <a>, let normal link happen
          return;
        }
        // otherwise, find a nested <a>
        const link = clickedEl.querySelector("a");
        if (link) {
          // Force the link click
          document.removeEventListener("click", handleDocClick);
          link.click();
        }
      };

      document.addEventListener("click", handleDocClick);

      return () => {
        window.removeEventListener("scroll", handleWindowScroll);
        document.removeEventListener("click", handleDocClick);
      };
    }
  }, [horizontal, fetchMore]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="relative flex w-full flex-col items-center">
      {horizontal ? (
        /* ================== HORIZONTAL MODE ================== */
        <>
          <div
            className="relative w-full overflow-hidden"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 1%, black 2%, black 98%, transparent 99%)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat"
            }}
          >
            <div
              ref={carouselRef}
              onScroll={handleHorizontalScroll}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onDragStart={handleDragStart}
              style={{
                userSelect: "none",
                width: "100%"
              }}
              className="no-scrollbar pointer-events-auto relative m-0 flex select-none overflow-x-scroll px-10"
            >
              {/* Render products */}
              {productList.map(item => (
                <div
                  key={String(item._id)}
                  className="carousel-item pointer-events-auto mx-2 inline-block aspect-square
                             max-h-[200px] min-h-[200px] min-w-[200px] max-w-[200px]
                             lg:max-h-[400px] lg:min-h-[400px] lg:min-w-[400px] lg:max-w-[400px]"
                >
                  <ProductCard
                    name={item.name}
                    id={item._id as ObjectId}
                    image={item.imageLinks?.[0] ?? ""}
                    price={item.price as string}
                    salePrice={item.salePrice as string}
                  />
                </div>
              ))}

              {/* Loading placeholder */}
              {loading && (
                <div
                  className="carousel-item inline-block max-h-[200px] min-h-[200px]
                             min-w-[200px] max-w-[200px] px-2
                             lg:max-h-[400px] lg:min-h-[400px] lg:min-w-[400px] lg:max-w-[400px]"
                >
                  <div className="flex h-full w-full animate-pulse items-center justify-center border border-gray-300 bg-gray-100">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                </div>
              )}

              {/* If we're at max, show "View More" link */}
              {productList.length >= maximumItems && (
                <Link to={`/browse/${sortToPath(searchQuery)}`} className="pointer-events-auto">
                  <div
                    className="carousel-item pointer-events-auto mx-2 flex min-h-[200px] min-w-[200px]
                               items-center justify-center border border-gray-300 p-4 text-gray-600
                               lg:min-h-[400px] lg:min-w-[400px]"
                  >
                    <p className="text-lg font-semibold">View More</p>
                  </div>
                </Link>
              )}
            </div>
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
        </>
      ) : (
        /* ================== VERTICAL MODE ================== */
        <div className="grid w-full grid-cols-3 gap-4 p-4 pb-6 pt-5" ref={carouselRef}>
          {/* Render products */}
          {productList.map(item => (
            <div key={String(item._id)} className="carousel-item pointer-events-auto">
              <ProductCard
                name={item.name}
                id={item._id as ObjectId}
                image={item.imageLinks?.[0] ?? ""}
                price={item.price as string}
                salePrice={item.salePrice as string}
              />
            </div>
          ))}

          {/* Loading placeholder */}
          {loading && (
            <div className="carousel-item h-40 w-full animate-pulse border border-gray-300 bg-gray-100 text-center leading-[10rem] text-gray-500">
              Loading...
            </div>
          )}

          {/* If at max, show "View More" */}
          {productList.length >= maximumItems && (
            <Link
              to={`/browse/${sortToPath(searchQuery)}`}
              className="carousel-item flex h-40 items-center justify-center border border-gray-300 text-gray-600"
            >
              <p className="text-lg font-semibold">View More</p>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export { ImageScroller };
