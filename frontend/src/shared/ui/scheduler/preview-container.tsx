"use client";

interface PreviewContainerProps {
  width: number;
  height: number;
  y: number;
  x: number;
  cursor?: string;
  children?: React.ReactNode;
}

export const PreviewContainer = ({
  width,
  height,
  y,
  x,
  cursor,
  children,
}: PreviewContainerProps) => {
  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: cursor,
        top: 0,
        left: 0,
        position: "absolute",
        boxSizing: "border-box",
        opacity: 0.7,
        zIndex: 20,
        willChange: "transform",
        border: "1px solid white",
      }}
    >
      {children}
    </div>
  );
};
