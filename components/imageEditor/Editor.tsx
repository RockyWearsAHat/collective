import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { BiUpload, BiZoomIn, BiZoomOut, BiMove, BiSolidMagicWand, BiTrash, BiUndo, BiRedo } from "react-icons/bi";

const tolerance = 30;

/** A simple Position interface for x,y. */
interface Position {
  x: number;
  y: number;
}

/** Updated Tool type with selection/deselection brushes. */
type Tool = "move" | "wand" | "box" | "brush" | "eraser" | "selbrush" | "deselbrush";

/* ─────────────────────────────────────────────────────────────
   Toolbar
   ───────────────────────────────────────────────────────────── */
interface ToolbarProps {
  initialTool: Tool;
  onToolChange: (newTool: Tool) => void;
  handleFileUpload: React.ChangeEventHandler<HTMLInputElement>;
  onSliderChange: React.ChangeEventHandler<HTMLInputElement>;
  onBrushSizeInputChange: React.ChangeEventHandler<HTMLInputElement>;
  brushSize: number;
  brushSizeInput: string;
  deleteSelection: () => void;
  selectionMask: Uint8Array | null;
  historyIndex: number;
  history: Uint8Array[];
  undo: () => void;
  redo: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

const Toolbar: React.FC<ToolbarProps> = memo(
  ({
    initialTool,
    onToolChange,
    handleFileUpload,
    onSliderChange,
    onBrushSizeInputChange,
    brushSize,
    brushSizeInput,
    deleteSelection,
    selectionMask,
    historyIndex,
    history,
    undo,
    redo,
    handleZoomIn,
    handleZoomOut
  }) => {
    const [selectedTool, setSelectedTool] = useState<Tool>(initialTool);

    const changeTool = (newTool: Tool) => {
      setSelectedTool(newTool);
      onToolChange(newTool);
    };

    const btnClass = (toolName: Tool) =>
      `flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
        selectedTool === toolName
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`;

    return (
      <div className="flex w-[200px] flex-col gap-2 border-l border-gray-200 p-4">
        {/* Upload */}
        <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          <BiUpload className="h-5 w-5 text-gray-600" />
        </label>
        <div className="my-1 h-px w-full bg-gray-200" />

        {/* Move */}
        <button className={btnClass("move")} onClick={() => changeTool("move")}>
          <BiMove className="h-5 w-5" />
        </button>

        {/* Wand */}
        <button className={btnClass("wand")} onClick={() => changeTool("wand")}>
          <BiSolidMagicWand className="h-5 w-5" />
        </button>

        {/* Box */}
        <button className={btnClass("box")} onClick={() => changeTool("box")}>
          <span className="text-sm">Box</span>
        </button>

        {/* Brush */}
        <button className={btnClass("brush")} onClick={() => changeTool("brush")}>
          <span className="text-sm">Br</span>
        </button>

        {/* Eraser */}
        <button className={btnClass("eraser")} onClick={() => changeTool("eraser")}>
          <span className="text-sm">Er</span>
        </button>

        {/* Selection Brush */}
        <button className={btnClass("selbrush")} onClick={() => changeTool("selbrush")}>
          <span className="text-sm">Sel+</span>
        </button>

        {/* Deselection Brush */}
        <button className={btnClass("deselbrush")} onClick={() => changeTool("deselbrush")}>
          <span className="text-sm">Sel-</span>
        </button>

        {/* Brush Size Slider */}
        <input type="range" min={1} max={200} step={1} value={brushSize} onChange={onSliderChange} className="mx-2" />

        {/* Brush Size Input */}
        <input
          type="text"
          className="w-16 border px-2 py-1 text-sm"
          value={brushSizeInput}
          onChange={onBrushSizeInputChange}
        />

        <div className="my-1 h-px w-full bg-gray-200" />

        {/* Zoom In */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <BiZoomIn className="h-5 w-5" />
        </button>

        {/* Zoom Out */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <BiZoomOut className="h-5 w-5" />
        </button>

        {/* Delete Selection */}
        {selectionMask && Array.from(selectionMask).some(val => val === 1) && (
          <>
            <div className="my-1 h-px w-full bg-gray-200" />
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 text-white transition-colors hover:bg-red-600"
              onClick={deleteSelection}
            >
              <BiTrash className="h-5 w-5" />
              <span>Delete Selection</span>
            </button>
          </>
        )}

        <div className="my-1 h-px w-full bg-gray-200" />

        {/* Undo */}
        <button
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
            historyIndex <= 0
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <BiUndo className="h-5 w-5" />
        </button>

        {/* Redo */}
        <button
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
            historyIndex >= history.length - 1
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <BiRedo className="h-5 w-5" />
        </button>
      </div>
    );
  }
);

const Editor: React.FC = () => {
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const moveOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const toolRef = useRef<Tool>("move");

  const [zoom, setZoom] = useState<number>(1);
  const zoomRef = useRef<number>(1);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [selectionMask, setSelectionMask] = useState<Uint8Array | null>(null);

  const [boxStart, setBoxStart] = useState<Position | null>(null);
  const [boxEnd, setBoxEnd] = useState<Position | null>(null);

  const [history, setHistory] = useState<Uint8Array[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [brushSize, setBrushSize] = useState<number>(10);
  const [brushSizeInput, setBrushSizeInput] = useState<string>("10");

  const dragStart = useRef<Position | null>(null);
  const isDragging = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const pendingPanXRef = useRef<number>(0);
  const pendingPanYRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const [mouseScreenPos, setMouseScreenPos] = useState<Position | null>(null);
  const [brushImagePos, setBrushImagePos] = useState<Position | null>(null);

  const [transformVersion, setTransformVersion] = useState(0);

  // Attempt synchronous flush, if available
  function flushIfAvailable(ctx: CanvasRenderingContext2D) {
    if ((ctx as any).flush) {
      (ctx as any).flush();
    }
  }

  const renderOverlayImmediately = async () => {
    if (!overlayCanvasRef.current || !overlayCtxRef.current || !canvasRef.current) return;

    canvasRef.current.style.zIndex = "1";
    overlayCanvasRef.current.style.zIndex = "9999";

    const overlay = overlayCanvasRef.current;
    const ctx = overlayCtxRef.current;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    ctx.save();
    ctx.translate(positionRef.current.x + w / 2, positionRef.current.y + h / 2);
    ctx.scale(zoomRef.current, zoomRef.current);
    ctx.translate(-w / 2, -h / 2);

    // 1) Pixel grid if zoom >= 4
    if (zoomRef.current >= 4 && originalImageData) {
      const imgW = originalImageData.width;
      const imgH = originalImageData.height;
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1 / zoomRef.current;
      for (let x = 0; x <= imgW; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, imgH);
        ctx.stroke();
      }
      for (let y = 0; y <= imgH; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(imgW, y);
        ctx.stroke();
      }
    }

    // 2) Entire selection mask
    if (selectionMask && originalImageData) {
      const wImg = originalImageData.width;
      selectionMask.forEach((part, i) => {
        if (part === 1) {
          const px = i % wImg;
          const py = Math.floor(i / wImg);
          ctx.fillStyle = "rgba(0,255,0,0.2)";
          ctx.fillRect(px, py, 1, 1);
        }
      });
    }

    // 3) Box selection preview
    if (toolRef.current === "box" && boxStart && boxEnd) {
      const x1 = Math.min(boxStart.x, boxEnd.x);
      const y1 = Math.min(boxStart.y, boxEnd.y);
      const ww = Math.abs(boxEnd.x - boxStart.x);
      const hh = Math.abs(boxEnd.y - boxStart.y);
      const strokeWidth = 2 / zoomRef.current;
      ctx.save();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = "rgba(0,0,255,0.6)";
      ctx.setLineDash([5, 3]);
      // Subtract 1 from right/bottom edges
      ctx.strokeRect(x1, y1, ww, hh);
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();

    // 4) Brush/Eraser pixel-locked preview
    if (
      mouseScreenPos &&
      brushImagePos &&
      (toolRef.current === "brush" ||
        toolRef.current === "eraser" ||
        toolRef.current === "selbrush" ||
        toolRef.current === "deselbrush")
    ) {
      ctx.save();
      if (zoomRef.current >= 4) {
        ctx.imageSmoothingEnabled = false;
        if ((ctx as any).webkitImageSmoothingEnabled !== undefined) {
          (ctx as any).webkitImageSmoothingEnabled = false;
        }
      }
      ctx.beginPath();
      const radiusOnScreen = (brushSize / 2) * zoomRef.current;
      ctx.arc(mouseScreenPos.x, mouseScreenPos.y, radiusOnScreen, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);

      if (toolRef.current === "selbrush") {
        ctx.strokeStyle = "rgba(0,255,0,0.8)";
      } else if (toolRef.current === "deselbrush") {
        ctx.strokeStyle = "rgba(255,0,0,0.8)";
      } else if (toolRef.current === "brush") {
        ctx.strokeStyle = "rgba(0,0,255,0.8)";
      } else if (toolRef.current === "eraser") {
        ctx.strokeStyle = "rgba(255,255,0,0.8)";
      }
      ctx.stroke();
      ctx.restore();
    }

    flushIfAvailable(ctx);
  };

  // On mount, set up main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    contextRef.current = ctx;

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Setup overlay
  useEffect(() => {
    if (!overlayCanvasRef.current || !containerRef.current) return;
    overlayCanvasRef.current.width = containerRef.current.clientWidth;
    overlayCanvasRef.current.height = containerRef.current.clientHeight;
    const ctx = overlayCanvasRef.current.getContext("2d");
    overlayCtxRef.current = ctx;
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      if ((ctx as any).webkitImageSmoothingEnabled !== undefined) {
        (ctx as any).webkitImageSmoothingEnabled = false;
      }
    }
  }, [image]);

  // Wheel for zoom/pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function wheelListener(e: WheelEvent) {
      e.preventDefault();
      if (!image) return;
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => {
          const newZ = Math.max(0.1, Math.min(10, prev * delta));
          zoomRef.current = newZ;
          updateCanvasTransform(positionRef.current.x, positionRef.current.y, newZ);
          return newZ;
        });
      } else {
        const newX = positionRef.current.x - e.deltaX;
        const newY = positionRef.current.y - e.deltaY;
        updateCanvasTransform(newX, newY);
      }
    }

    container.addEventListener("wheel", wheelListener, { passive: false });
    return () => container.removeEventListener("wheel", wheelListener);
  }, [image]);

  // File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;
        let canvasWidth, canvasHeight;

        if (containerAspect > imgAspect) {
          canvasHeight = containerHeight;
          canvasWidth = canvasHeight * imgAspect;
        } else {
          canvasWidth = containerWidth;
          canvasHeight = canvasWidth / imgAspect;
        }

        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        canvasRef.current.style.transformOrigin = "0 0";

        const startX = (containerWidth - canvasWidth) / 2;
        const startY = (containerHeight - canvasHeight) / 2;
        positionRef.current = { x: startX, y: startY };

        const { x: cX, y: cY } = clampScreenPosition(startX, startY, 1);
        positionRef.current.x = cX;
        positionRef.current.y = cY;

        zoomRef.current = 1;
        setZoom(1);
        updateCanvasTransform(cX, cY, 1);

        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        setOriginalImageData(imageData);

        const currentDataCopy = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
        setCurrentImageData(currentDataCopy);

        const blankMask = new Uint8Array(imageData.width * imageData.height);
        setSelectionMask(blankMask);

        setImage(img);
        setHistory([]);
        setHistoryIndex(-1);
      };
      if (reader.result) {
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // MOUSE EVENTS
  function handleMouseDown(e: React.MouseEvent) {
    if (!canvasRef.current || !image || !containerRef.current) return;

    if (toolRef.current === "move") {
      isPanningRef.current = true;
      const containerRect = containerRef.current.getBoundingClientRect();
      moveOffsetRef.current.x = e.clientX - containerRect.left - positionRef.current.x;
      moveOffsetRef.current.y = e.clientY - containerRect.top - positionRef.current.y;
      isDragging.current = true;
      startPanLoop();
      return;
    }

    if (!currentImageData) return;
    let { x, y } = screenToImageCoords(e);
    if (zoomRef.current >= 4) {
      x = Math.round(x);
      y = Math.round(y);
    }

    dragStart.current = { x, y };
    isDragging.current = true;

    if (
      toolRef.current === "brush" ||
      toolRef.current === "eraser" ||
      toolRef.current === "selbrush" ||
      toolRef.current === "deselbrush"
    ) {
      setBrushImagePos({ x, y });
    }

    if (toolRef.current === "selbrush" || toolRef.current === "deselbrush") {
      applySelectionBrushOrDeselection(x, y, e.shiftKey);
      return;
    }
    if (toolRef.current === "brush" || toolRef.current === "eraser") {
      applyBrushOrEraser(x, y);
      return;
    }
    if (toolRef.current === "box") {
      setBoxStart({ x, y });
      setBoxEnd(null);
    }
    if (toolRef.current === "wand") {
      magicWandSelect(x, y, tolerance, e.shiftKey);
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!canvasRef.current || !image || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let scrX = e.clientX - containerRect.left;
    let scrY = e.clientY - containerRect.top;
    // Pixel-lock if zoom >=4
    if (zoomRef.current >= 4) {
      scrX = Math.round(scrX);
      scrY = Math.round(scrY);
    }
    setMouseScreenPos({ x: scrX, y: scrY });

    if (!isDragging.current || !currentImageData) {
      return;
    }

    if (toolRef.current === "move") {
      const newX = e.clientX - containerRect.left - moveOffsetRef.current.x;
      const newY = e.clientY - containerRect.top - moveOffsetRef.current.y;
      pendingPanXRef.current = newX;
      pendingPanYRef.current = newY;
      return;
    }

    let { x, y } = screenToImageCoords(e);
    if (zoomRef.current >= 4) {
      x = Math.round(x);
      y = Math.round(y);
    }

    if (
      toolRef.current === "brush" ||
      toolRef.current === "eraser" ||
      toolRef.current === "selbrush" ||
      toolRef.current === "deselbrush"
    ) {
      setBrushImagePos({ x, y });
    }

    if (toolRef.current === "selbrush" || toolRef.current === "deselbrush") {
      applySelectionBrushOrDeselection(x, y, e.shiftKey);
      return;
    }
    if (toolRef.current === "brush" || toolRef.current === "eraser") {
      applyBrushOrEraser(x, y);
      return;
    }
    if (toolRef.current === "box" && boxStart) {
      setBoxEnd({ x, y });
      return;
    }
    if (toolRef.current === "wand") {
      magicWandSelect(x, y, tolerance, e.shiftKey);
      return;
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    isDragging.current = false;

    if (toolRef.current === "move") {
      isPanningRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }

    if (toolRef.current === "box" && boxStart && boxEnd && currentImageData && selectionMask) {
      const w = currentImageData.width;
      const h = currentImageData.height;

      const x1 = Math.floor(Math.min(boxStart.x, boxEnd.x));
      const x2 = Math.floor(Math.max(boxStart.x, boxEnd.x));
      const y1 = Math.floor(Math.min(boxStart.y, boxEnd.y));
      const y2 = Math.floor(Math.max(boxStart.y, boxEnd.y));

      // Subtract 1 from the bottom/right edges
      const rectWidth = x2 - x1 - 1 >= 0 ? x2 - x1 - 1 : 0;
      const rectHeight = y2 - y1 - 1 >= 0 ? y2 - y1 - 1 : 0;

      if (rectWidth === 0 && rectHeight === 0) {
        if (x1 >= 0 && x1 < w && y1 >= 0 && y1 < h) {
          if (!e.shiftKey) {
            for (let i = 0; i < selectionMask.length; i++) {
              selectionMask[i] = 0;
            }
          }
          const idx = y1 * w + x1;
          selectionMask[idx] = 1;
          setSelectionMask(new Uint8Array(selectionMask));
          saveMaskToHistory();
          renderOverlayImmediately();
        } else {
          for (let i = 0; i < selectionMask.length; i++) {
            selectionMask[i] = 0;
          }
          setSelectionMask(new Uint8Array(selectionMask));
          saveMaskToHistory();
          renderOverlayImmediately();
        }
        return;
      }

      if (!e.shiftKey) {
        for (let i = 0; i < selectionMask.length; i++) {
          selectionMask[i] = 0;
        }
      }
      for (let cy = y1; cy <= y1 + rectHeight; cy++) {
        for (let cx = x1; cx <= x1 + rectWidth; cx++) {
          if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
          const idx = cy * w + cx;
          selectionMask[idx] = 1;
        }
      }
      setSelectionMask(new Uint8Array(selectionMask));
      saveMaskToHistory();
      renderOverlayImmediately();
    }
  }

  function handleMouseLeave() {
    isDragging.current = false;
    isPanningRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }

  function startPanLoop() {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    function panFrame() {
      if (!isPanningRef.current) return;
      updateCanvasTransform(pendingPanXRef.current, pendingPanYRef.current);
      renderOverlayImmediately(); // re-draw the entire selection
      rafIdRef.current = requestAnimationFrame(panFrame);
    }
    rafIdRef.current = requestAnimationFrame(panFrame);
  }

  // BFS wand
  function magicWandSelect(startX: number, startY: number, tol: number, isDeselecting: boolean) {
    if (!currentImageData || !selectionMask) return;
    const { width, height, data } = currentImageData;
    const totalPixels = width * height;
    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    if (sx < 0 || sx >= width || sy < 0 || sy >= height) return;

    const visited = new Uint8Array(totalPixels);
    const startIdx = (sy * width + sx) * 4;
    const targetColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];

    if (!isDeselecting && selectionMask[sy * width + sx] === 1) {
      return;
    }

    const stack: Array<[number, number]> = [[sx, sy]];
    while (stack.length) {
      const [px, py] = stack.pop()!;
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      const idx = py * width + px;
      if (visited[idx] === 1) continue;
      visited[idx] = 1;

      if (data[idx * 4 + 3] === 0) continue;

      const currentColor = [data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2], data[idx * 4 + 3]];
      const alreadySelected = selectionMask[idx] === 1;

      if (isDeselecting) {
        if (!alreadySelected) continue;
      } else {
        if (alreadySelected) continue;
      }

      if (
        Math.abs(currentColor[0] - targetColor[0]) <= tol &&
        Math.abs(currentColor[1] - targetColor[1]) <= tol &&
        Math.abs(currentColor[2] - targetColor[2]) <= tol &&
        Math.abs(currentColor[3] - targetColor[3]) <= tol
      ) {
        selectionMask[idx] = isDeselecting ? 0 : 1;
        stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
      }
    }
    setSelectionMask(new Uint8Array(selectionMask));
    renderOverlayImmediately();
    saveMaskToHistory();
  }

  // selection/deselection brush
  function applySelectionBrushOrDeselection(px: number, py: number, shiftKey: boolean) {
    if (!currentImageData || !selectionMask) return;
    const radius = Math.floor(brushSize / 2);
    const w = currentImageData.width;
    const h = currentImageData.height;

    const isSelBrush = toolRef.current === "selbrush";
    const isAdd = isSelBrush ? !shiftKey : shiftKey;

    for (let cy = -radius; cy <= radius; cy++) {
      for (let cx = -radius; cx <= radius; cx++) {
        if (cx * cx + cy * cy > radius * radius) continue;
        const tx = Math.floor(px + cx);
        const ty = Math.floor(py + cy);
        if (tx < 0 || tx >= w || ty < 0 || ty >= h) continue;

        const idx = ty * w + tx;
        selectionMask[idx] = isAdd ? 1 : 0;
      }
    }
    setSelectionMask(new Uint8Array(selectionMask));
    renderOverlayImmediately();
    saveMaskToHistory();
  }

  // Delete selection
  function deleteSelection() {
    if (!canvasRef.current || !contextRef.current || !selectionMask || !currentImageData) return;
    const { data } = currentImageData;
    for (let i = 0; i < selectionMask.length; i++) {
      if (selectionMask[i] === 1) {
        const base = i * 4;
        data[base + 3] = 0;
        selectionMask[i] = 0;
      }
    }
    contextRef.current.putImageData(currentImageData, 0, 0);
    setSelectionMask(new Uint8Array(selectionMask));
    renderOverlayImmediately();
  }

  // Undo / Redo
  function undo() {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const olderMask = history[newIndex];
    setSelectionMask(new Uint8Array(olderMask));
    renderOverlayImmediately();
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const newerMask = history[newIndex];
    setSelectionMask(new Uint8Array(newerMask));
    renderOverlayImmediately();
  }

  function saveMaskToHistory() {
    if (!selectionMask) return;
    const snap = new Uint8Array(selectionMask);
    const newHistory = [...history.slice(0, historyIndex + 1), snap];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  // Brush/Eraser partial edit
  function applyBrushOrEraser(px: number, py: number) {
    if (!canvasRef.current || !contextRef.current || !currentImageData) return;
    if (!selectionMask) {
      setSelectionMask(new Uint8Array(currentImageData.width * currentImageData.height));
      renderOverlayImmediately();
    }
    if (!selectionMask) return;

    const { width, height, data } = currentImageData;
    const radius = Math.floor(brushSize / 2);
    const hasAnySelected = selectionMaskSomeOne(selectionMask);

    for (let cy = -radius; cy <= radius; cy++) {
      for (let cx = -radius; cx <= radius; cx++) {
        if (cx * cx + cy * cy > radius * radius) continue;
        const tx = Math.floor(px + cx);
        const ty = Math.floor(py + cy);
        if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;

        const idx = ty * width + tx;
        if (hasAnySelected && selectionMask[idx] !== 1) {
          continue;
        }

        const baseIndex = idx * 4;
        if (toolRef.current === "brush") {
          if (originalImageData) {
            const origData = originalImageData.data;
            data[baseIndex] = origData[baseIndex];
            data[baseIndex + 1] = origData[baseIndex + 1];
            data[baseIndex + 2] = origData[baseIndex + 2];
            data[baseIndex + 3] = origData[baseIndex + 3];
          }
        } else if (toolRef.current === "eraser") {
          data[baseIndex + 3] = 0;
        }
      }
    }
    contextRef.current.putImageData(currentImageData, 0, 0);
    renderOverlayImmediately();
  }

  function selectionMaskSomeOne(mask: Uint8Array | null) {
    if (!mask) return false;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) return true;
    }
    return false;
  }

  // Hide old selection overlay on main canvas
  useEffect(() => {
    if (!currentImageData || !canvasRef.current || !contextRef.current) return;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.putImageData(currentImageData, 0, 0);

    ctx.save();
    ctx.globalAlpha = 0;

    if (selectionMask && originalImageData) {
      const w = originalImageData.width;
      for (let i = 0; i < selectionMask.length; i++) {
        if (selectionMask[i] === 1) {
          const px = i % w;
          const py = Math.floor(i / w);
          ctx.fillStyle = "rgba(0,255,0,0.5)";
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }

    if (toolRef.current === "box" && boxStart && boxEnd) {
      const x1 = Math.min(boxStart.x, boxEnd.x);
      const y1 = Math.min(boxStart.y, boxEnd.y);
      const w = Math.abs(boxEnd.x - boxStart.x);
      const h = Math.abs(boxEnd.y - boxStart.y);
      ctx.strokeStyle = "rgba(0,0,255,0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x1, y1, w, h);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }, [selectionMask, currentImageData, originalImageData, boxStart, boxEnd]);

  useEffect(() => {
    renderOverlayImmediately();
  }, [
    selectionMask,
    boxStart,
    boxEnd,
    transformVersion,
    brushSize,
    originalImageData,
    mouseScreenPos,
    brushImagePos,
    renderOverlayImmediately
  ]);

  function updateCanvasTransform(newX: number, newY: number, forcedZoom?: number) {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const actualZoom = forcedZoom !== undefined ? forcedZoom : zoomRef.current;

    const { x: cX, y: cY } = clampScreenPosition(newX, newY, actualZoom);
    positionRef.current.x = cX;
    positionRef.current.y = cY;

    const w = canvas.width;
    const h = canvas.height;
    canvas.style.transform = `
      translate(${cX}px, ${cY}px)
      translate(${w / 2}px, ${h / 2}px)
      scale(${actualZoom})
      translate(${-w / 2}px, ${-h / 2}px)
    `;

    setTransformVersion(prev => prev + 1);
  }

  function clampScreenPosition(x: number, y: number, z: number): Position {
    if (!containerRef.current || !canvasRef.current) {
      return { x, y };
    }
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const halfW = w / 2;
    const halfH = h / 2;
    const padding = 100;

    const boundingLeft = x + halfW - halfW * z;
    // const boundingRight = boundingLeft + w * z;
    const boundingTop = y + halfH - halfH * z;
    // const boundingBottom = boundingTop + h * z;

    let newLeft = boundingLeft;
    const minLeft = padding - w * z;
    const maxLeft = containerWidth - padding;
    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

    let newTop = boundingTop;
    const minTop = padding - h * z;
    const maxTop = containerHeight - padding;
    newTop = Math.max(minTop, Math.min(maxTop, newTop));

    const newX = newLeft - halfW + halfW * z;
    const newY = newTop - halfH + halfH * z;

    return { x: newX, y: newY };
  }

  const handleZoomIn = useCallback(() => {
    if (!canvasRef.current) return;
    setZoom(prev => {
      const newZ = Math.min(10, prev * 1.2);
      zoomRef.current = newZ;
      updateCanvasTransform(positionRef.current.x, positionRef.current.y, newZ);
      return newZ;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!canvasRef.current) return;
    setZoom(prev => {
      const newZ = Math.max(0.1, prev * 0.8);
      zoomRef.current = newZ;
      updateCanvasTransform(positionRef.current.x, positionRef.current.y, newZ);
      return newZ;
    });
  }, []);

  const onSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBrushSize(val);
    setBrushSizeInput(String(val));
  }, []);

  function screenToImageCoords(e: React.MouseEvent): Position {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  }

  const onBrushSizeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setBrushSizeInput(raw);
    const maybeNum = parseInt(raw, 10);
    if (raw === "" || isNaN(maybeNum)) return;
    const clamped = Math.max(1, Math.min(maybeNum, 200));
    setBrushSize(clamped);
    setBrushSizeInput(String(clamped));
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="relative flex h-[80vh] w-[90vw] bg-white shadow">
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden bg-gray-50"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute touch-none"
            style={{ transformOrigin: "0 0", top: 0, left: 0, zIndex: 1 }}
          />
          <canvas ref={overlayCanvasRef} className="pointer-events-none absolute" style={{ top: 0, left: 0 }} />
        </div>

        <Toolbar
          initialTool="move"
          onToolChange={(newTool: Tool) => {
            toolRef.current = newTool;
          }}
          handleFileUpload={handleFileUpload}
          onSliderChange={onSliderChange}
          onBrushSizeInputChange={onBrushSizeInputChange}
          brushSize={brushSize}
          brushSizeInput={brushSizeInput}
          deleteSelection={deleteSelection}
          selectionMask={selectionMask}
          historyIndex={historyIndex}
          history={history}
          undo={undo}
          redo={redo}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />
      </div>
    </div>
  );
};

export default Editor;
