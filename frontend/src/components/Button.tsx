import { useState } from "react";
import { twJoin, twMerge } from "tailwind-merge";

import getValidChildren from "@/utils/getValidChildren";
import isValidIcon from "@/utils/isValidIcon";

import LoaderIcon from "./icons/LoaderIcon";

/** 버튼 스타일 맵 */
const VARIANT_STYLES = {
  size: {
    lg: "px-6 py-2 min-h-12",
    md: "px-4 py-1.5 min-h-10 text-sm",
    sm: "px-2 py-1 min-h-8 text-sm",
  },
  iconOnlySize: {
    lg: "w-fit p-12",
    md: "w-fit p-8",
    sm: "w-fit p-4",
  },
  round: {
    rounded: "rounded-xl",
    circular: "rounded-[999px]",
    square: "",
  },
  variant: {
    primary: "bg-black-800 text-white-200",
    secondary: "bg-white-300 text-black-800",
    outline: "border bg-white-200 border-black-600",
    ghost: "bg-white-100 text-white-700",
    danger: "bg-red-500 text-white-100",
  },
  loader: {
    primary: "text-white",
    secondary: "text-black-800",
    outline: "text-black-600",
    ghost: "text-black-800",
    danger: "text-white-200",
  },
  loaderSize: {
    lg: "size-[0.875rem] md:size-[1rem]",
    md: "size-[0.75rem] md:size-[0.875rem]",
    sm: "size-[0.75rem] md:size-[0.875rem]",
  },
};

interface ButtonOwnProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onClick" | "disabled" | "className" | "ref"
  > {
  /** 버튼 내부 콘텐츠 (문자열, span, p 태그만을 지원) */
  children?: React.ReactNode;
  /** 클릭 핸들러 */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** 버튼 스타일 */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** 버튼 타입 */
  type?: "button" | "submit" | "reset";
  /** 버튼 DOM에 접근하기 위한 ref */
  ref?: React.Ref<HTMLButtonElement>;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 버튼 크기 */
  size?: "lg" | "md" | "sm";
  /** 버튼 모서리 */
  round?: "rounded" | "circular" | "square";
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
  /** 버튼 스타일 확장용 className */
  className?: string;
  /** 아이콘 전용 버튼 */
  iconOnly?: boolean;
}

/**
 * Button 컴포넌트
 *
 * @description
 * - variant / size / round 등 props로 스타일을 제어할 수 있습니다.
 * - loading prop를 통한 로딩 상태 시 `LoaderIcon`을 표시하고 클릭 이벤트를 차단합니다.
 * - 비활성화 상태에서는 클릭 이벤트가 차단됩니다.
 * - 연타 방지를 위해 내부적으로 0.5초 쿨다운을 둡니다.
 * - children은 문자열, `<span>`, `<p>` 태그만 지원합니다.
 *
 * @param {React.ReactNode} props.children 버튼 내부 콘텐츠 (문자열, span, p 태그만 지원)
 * @param { onClick?: React.MouseEventHandler<HTMLButtonElement>} props.onClick 버튼 클릭 핸들러
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary'] 버튼 스타일
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] 버튼 타입
 * @param {React.Ref<HTMLButtonElement>} [props.ref] 버튼 DOM에 접근하기 위한 ref
 * @param {boolean} [props.loading=false] 로딩 상태 (true일 경우 LoaderIcon 표시 및 클릭 차단)
 * @param {boolean} [props.disabled=false] 비활성화 상태
 * @param {'lg' | 'md' | 'sm'} [props.size='lg'] 버튼 크기
 * @param {'rounded' | 'circular' | 'square'} [props.round='rounded'] 버튼 모서리 스타일
 * @param {React.ReactNode} [props.leftIcon] 왼쪽 아이콘
 * @param {React.ReactNode} [props.rightIcon] 오른쪽 아이콘
 * @param {string} [props.className] 버튼 스타일 확장용 className
 * @param {boolean} [props.iconOnly] 아이콘 전용 버튼 여부
 *
 * @example 기본 사용
 * ```tsx
 * <Button onClick={() => console.log('clicked')}>
 *   확인
 * </Button>
 * ```
 *
 * @example 아이콘 포함
 * ```tsx
 * <Button
 *   variant="secondary"
 *   size="md"
 *   leftIcon={<CheckIcon />}
 *   rightIcon={<ChevronRightIcon />}
 *   onClick={submitForm}
 * >
 *   저장하기
 * </Button>
 * ```
 *
 * @example 로딩 상태
 * ```tsx
 * <Button loading disabled onClick={submitForm}>
 *   제출
 * </Button>
 * ```
 */
export default function Button({
  loading = false,
  disabled = false,
  type = "button",
  variant = "primary",
  ref,
  children,
  onClick,
  round = "rounded",
  size = "lg",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  iconOnly = false,
  ...props
}: ButtonOwnProps) {
  const [cooldown, setCooldown] = useState(false); // 클릭 쿨타임

  /**
   * 내부 클릭 핸들러
   *
   * - `disabled`/`loading`/`cooldown` 상태에서는 `preventDefault()` 후 조기 반환합니다.
   * - 성공 시 쿨다운 타이머(500ms)를 설정한 뒤 `onClick`을 호출합니다.
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading || cooldown) {
      e.preventDefault();
      return;
    }
    setCooldown(true);
    setTimeout(() => setCooldown(false), 500); // 0.5초 동안 연타 막기

    onClick?.(e);
  };

  // children에서 텍스트만 필터링
  const validChildren = getValidChildren(children);

  // leftIcon과 rightIcon에서 icon만 필터링 (컴포넌트로 사용할거라 대문자로 시작)
  const ValidLeftIcon = isValidIcon(LeftIcon) ? LeftIcon : null;
  const ValidRightIcon = isValidIcon(RightIcon) ? RightIcon : null;

  // 기본 버튼 스타일 (disabled / hover / active 스타일 포함)
  const buttonClassNames = twJoin(
    "w-fit flex gap-8 flex-shrink-0 justify-center items-center leading-none cursor-pointer p-4",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "enabled:hover:brightness-85 enabled:active:brightness-80",
    iconOnly ? VARIANT_STYLES.iconOnlySize[size] : VARIANT_STYLES.size[size],
    variant ? VARIANT_STYLES.variant[variant] : "border-none",
    round ? VARIANT_STYLES.round[round] : ""
  );

  return (
    <button
      ref={ref}
      aria-busy={loading || undefined}
      className={twMerge(buttonClassNames, className)}
      disabled={disabled || loading}
      type={type}
      onClick={handleClick}
      {...props}
    >
      {!loading && ValidLeftIcon && (
        <span className="flex shrink-0 items-center justify-center">
          {ValidLeftIcon}
        </span>
      )}
      {loading ? (
        <LoaderIcon
          className={twMerge(
            "animate-spin",
            VARIANT_STYLES.loader[variant],
            VARIANT_STYLES.loaderSize[size]
          )}
        />
      ) : (
        !iconOnly && validChildren
      )}
      {!loading && ValidRightIcon && (
        <span className="flex shrink-0 items-center justify-center">
          {ValidRightIcon}
        </span>
      )}
    </button>
  );
}
