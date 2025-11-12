import { twMerge } from "tailwind-merge";

/**
 * MinusIcon
 *
 * 단일 가로 막대(`-`)를 표현하는 아이콘 컴포넌트입니다.
 *
 * @param {string} [className] Tailwind 유틸리티 클래스. 예: `"size-16 text-gray-500"`.
 * @param {React.SVGProps<SVGSVGElement>} [props] 표준 SVG 속성(onClick, aria-*, data-* 등).
 * @returns {JSX.Element} SVG 아이콘 요소.
 */
export default function MinusIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={twMerge("size-24", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18 12.998H6C5.73478 12.998 5.48043 12.8926 5.29289 12.7051C5.10536 12.5176 5 12.2632 5 11.998C5 11.7328 5.10536 11.4784 5.29289 11.2909C5.48043 11.1033 5.73478 10.998 6 10.998H18C18.2652 10.998 18.5196 11.1033 18.7071 11.2909C18.8946 11.4784 19 11.7328 19 11.998C19 12.2632 18.8946 12.5176 18.7071 12.7051C18.5196 12.8926 18.2652 12.998 18 12.998Z"
        fill="currentColor"
      />
    </svg>
  );
}

MinusIcon.displayName = "MinusIcon";
