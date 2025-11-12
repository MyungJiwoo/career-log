import { Children, isValidElement } from 'react';

/**
 * getValidChildren
 *
 * @description
 * 전달된 `children` 중에서 버튼/텍스트 컴포넌트에서 유효하게 취급할 수 있는 노드만 필터링합니다.
 * - 문자열(`string`)은 그대로 허용합니다.
 * - React 엘리먼트 중에서는 `<span>`과 `<p>`만 허용합니다.
 * - 그 외 타입의 자식은 무시됩니다.
 *
 * @param {React.ReactNode} children React children 노드 (단일 혹은 배열)
 * @returns {React.ReactNode[]} 유효한 children만 담긴 배열
 *
 * @example 문자열만 허용
 * ```tsx
 * getValidChildren("Hello")
 * => ["Hello"]
 * ```
 *
 * @example span과 p 태그 허용
 * ```tsx
 * getValidChildren([
 *   <span key="1">텍스트</span>,
 *   <div key="2">무시됨</div>,
 *   "문자열"
 * ])
 * => [<span>텍스트</span>, "문자열"]
 * ```
 */
export default function getValidChildren(children: React.ReactNode): React.ReactNode[] {
  const childrenArray = Children.toArray(children);

  return childrenArray.filter((child) => {
    // 문자열과 숫자 허용
    if (typeof child === 'string' || typeof child === 'number') return true;
    // span, p 태그 허용
    if (isValidElement(child) && (child.type === 'span' || child.type === 'p')) {
      return true;
    }

    return false;
  });
}
