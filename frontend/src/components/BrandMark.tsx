export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="shrink-0 box-border flex flex-col justify-center gap-[3px] px-[5px] border-2 border-current rounded-[6px]"
    >
      <span className="h-[2px] rounded-[1px] bg-current" />
      <span className="h-[2px] w-[60%] rounded-[1px] bg-current" />
    </span>
  );
}
