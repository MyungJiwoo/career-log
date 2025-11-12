import { isValidElement, type JSXElementConstructor } from 'react';

/**
 * isValidIcon
 *
 * @description
 * React 노드가 아이콘 컴포넌트인지 판별합니다.
 * - 함수/클래스 컴포넌트만 검사하며, 컴포넌트의 `displayName` 또는 `name`에 `"Icon"` 문자열이 포함되어야 합니다.
 *
 * @param {React.ReactNode} node 검사할 React 노드
 * @returns {boolean} 아이콘 컴포넌트이면 `true`, 아니면 `false`
 *
 * @example 아이콘 컴포넌트일 때
 * ```tsx
 * import { CheckIcon } from '@components/icons';
 *
 * isValidIcon(<CheckIcon />) // true
 * ```
 *
 * @example displayName 기반 검사
 * ```tsx
 * const Custom = () => <svg />;
 * Custom.displayName = "CustomIcon";
 *
 * isValidIcon(<Custom />) // true
 * ```
 */
export default function isValidIcon(node: React.ReactNode) {
  if (!isValidElement(node)) return false;

  // node.type 은 string(태그) 또는 컴포넌트 타입일 수 있음
  if (typeof node.type === 'string') return false;

  // 함수/클래스 컴포넌트 타입으로 좁히기
  const type = node.type as JSXElementConstructor<unknown> & { displayName?: string };

  const displayName = type.displayName ?? type.name;
  return typeof displayName === 'string' && displayName.includes('Icon');
}
