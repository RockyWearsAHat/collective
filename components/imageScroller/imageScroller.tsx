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

  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  // For pointer dragging (horizontal only)
  const [pointerDown, setPointerDown] = useState(false);
  const isDraggingRef = useRef(false);
  const [dragAxis, setDragAxis] = useState<"" | "horizontal" | "vertical">("");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const pageScrollTopRef = useRef(0);
  const clickedElementRef = useRef<HTMLElement | null>(null);

  // For measuring item width if horizontal
  const [itemWidth, setItemWidth] = useState(400);

  const { fn: searchProducts, loading } = useMutation({
    url: "/api/products/getProducts",
    method: "POST"
  });

  // 1. Wrap fetchMore in useCallback so it’s stable:
  const fetchMore = useCallback(async () => {
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

      // Append new items
      const newMap = new Map(itemsMap);
      for (const item of serverData) {
        const idStr = String(item._id); // ensure a unique string key
        newMap.set(idStr, item);
      }
      // If we hit maximum
      if (newMap.size >= maximumItems) {
        setHasMore(false);
      }
      setItemsMap(newMap);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }, [hasMore, isFetching, productList.length, maximumItems, searchProducts, searchQuery, chunkSize, itemsMap]);

  // 2. Fetch initial chunk on mount
  useEffect(() => {
    void fetchMore(); // fetch the first batch
  }, [fetchMore]);

  // ------------------- HORIZONTAL SCROLL LOGIC -------------------
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

  // For horizontal trackpad scroll
  useEffect(() => {
    if (!horizontal) return;
    const el = carouselRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      // We want to allow vertical scroll of the page, but do a custom horizontal
      const scroller = e.currentTarget as HTMLElement;
      const pageContent = document.getElementById("root")?.children[1] as HTMLElement | null;

      // vertical => pass to page
      if (pageContent && e.deltaY !== 0) {
        pageContent.scrollTop += e.deltaY;
      }
      // horizontal => block default & manually move scroller
      if (e.deltaX !== 0) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaX;
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [horizontal]);

  // Horizontal scroll event for infinite load
  function handleHorizontalScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const pos = el.scrollLeft + el.clientWidth;
    const max = el.scrollWidth;
    // If near the right edge => fetch
    if (max - pos < itemWidth) {
      void fetchMore();
    }
  }

  function handleNextClick() {
    if (!carouselRef.current || !horizontal) return;
    const el = carouselRef.current;
    const currentIndex = Math.round(el.scrollLeft / itemWidth);
    const nextIndex = currentIndex + 1;
    const finalStop = Math.min(nextIndex * itemWidth, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: finalStop, behavior: "smooth" });

    // Preload next chunk if we're near the right edge
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

  // Horizontal pointer/drag logic
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (e.button !== 0) return;
    clickedElementRef.current = e.target as HTMLElement;
    setPointerDown(true);
    isDraggingRef.current = false;
    setDragAxis("");
    setStartX(e.clientX);
    setStartY(e.clientY);
    setScrollLeft(e.currentTarget.scrollLeft);

    // For vertical scroll fallback
    const pageContent = document.getElementById("root")?.children[1] as HTMLElement | null;
    pageScrollTopRef.current = pageContent?.scrollTop ?? 0;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal || !pointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Lock axis after crossing DRAG_THRESHOLD
    if (!isDraggingRef.current) {
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        setDragAxis(Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical");
      }
      return;
    }

    // Once locked in, we do manual scrolling in that axis
    e.preventDefault();
    if (dragAxis === "horizontal") {
      e.currentTarget.scrollLeft = scrollLeft - dx;
    } else if (dragAxis === "vertical") {
      // fallback: scroll the main page
      const pageContent = document.getElementById("root")?.children[1] as HTMLElement | null;
      if (pageContent) {
        pageContent.scrollTop = pageScrollTopRef.current - dy;
      }
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (!isDraggingRef.current) {
      // No real drag => simulate click
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      let link: HTMLElement | null = null;
      if (el.parentElement?.tagName === "A") {
        link = el.parentElement as HTMLElement;
      } else {
        link = el.querySelector("a");
      }
      link?.click();
    } else {
      if (dragAxis === "horizontal") {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
    setPointerDown(false);
    isDraggingRef.current = false;
    setDragAxis("");
    clickedElementRef.current = null;
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (!horizontal) return;
    if (pointerDown && isDraggingRef.current && dragAxis === "horizontal") {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setPointerDown(false);
    isDraggingRef.current = false;
    setDragAxis("");
    clickedElementRef.current = null;
  }

  function handleDragStart(e: React.DragEvent) {
    // Prevent default browser image-drag
    e.preventDefault();
  }

  // ------------------ VERTICAL SCROLL LOGIC VIA WINDOW ------------------
  useEffect(() => {
    if (!horizontal) {
      const handleWindowScroll = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        if (fullHeight - (scrollY + viewportHeight) < 300) {
          void fetchMore(); // always call the stable fetchMore
        }
      };

      window.addEventListener("scroll", handleWindowScroll);
      return () => {
        window.removeEventListener("scroll", handleWindowScroll);
      };
    }
  }, [horizontal, hasMore, isFetching, productList.length, maximumItems, fetchMore]);

  return (
    <div className="relative flex w-full flex-col items-center">
      {horizontal ? (
        // -------------------- HORIZONTAL MODE --------------------
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
              className="no-scrollbar pointer-events-auto relative m-0 flex select-none overflow-x-scroll px-10"
              style={{
                cursor: pointerDown ? "grabbing" : "grab",
                userSelect: "none",
                width: "100%"
              }}
            >
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

              {productList.length >= maximumItems && (
                <Link to={`/browse/${sortToPath(searchQuery)}`} className="pointer-events-auto">
                  <div
                    className="pointer-events-auto mx-2 flex min-h-[200px] min-w-[200px]
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
        // --------------------- VERTICAL MODE ---------------------
        <div className="grid w-full grid-cols-3 gap-4 p-4 pb-6 pt-5">
          {productList.map(item => (
            <div key={String(item._id)}>
              <ProductCard
                name={item.name}
                id={item._id as ObjectId}
                image={item.imageLinks?.[0] ?? ""}
                price={item.price as string}
                salePrice={item.salePrice as string}
              />
            </div>
          ))}

          {loading && (
            <div className="h-40 w-full animate-pulse border border-gray-300 bg-gray-100 text-center leading-[10rem] text-gray-500">
              Loading...
            </div>
          )}

          {productList.length >= maximumItems && (
            <Link
              to={`/browse/${sortToPath(searchQuery)}`}
              className="flex h-40 items-center justify-center border border-gray-300 text-gray-600"
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
