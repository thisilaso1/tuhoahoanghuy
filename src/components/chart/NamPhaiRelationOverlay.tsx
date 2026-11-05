import React, { useLayoutEffect, useState } from 'react';
import { calculateNamPhaiRelationGeometry, type ChartRect, type RelationType } from '../../domain/namPhaiEdgeAnchorEngine';

interface Props {
  containerRef: React.RefObject<HTMLElement | null>;
  selectedIndex: number | null;
  enabled: { tamHop: boolean; xungChieu: boolean; giapCung: boolean; lines: boolean };
}
interface Geometry { width: number; height: number; paths: Array<{ id: string; d: string; type: RelationType }> }

export const NamPhaiRelationOverlay: React.FC<Props> = ({ containerRef, selectedIndex, enabled }) => {
  const [geometry, setGeometry] = useState<Geometry>({ width: 1, height: 1, paths: [] });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || selectedIndex === null || !enabled.lines) {
      setGeometry({ width: 1, height: 1, paths: [] });
      return;
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = container.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return;
        const rects = new Map<number, ChartRect>();
        container.querySelectorAll<HTMLElement>('[data-palace-index]').forEach((cell) => {
          const index = Number(cell.dataset.palaceIndex);
          const rect = cell.getBoundingClientRect();
          if (Number.isInteger(index) && rect.width > 0 && rect.height > 0) {
            rects.set(index, {
              left: rect.left - bounds.left,
              top: rect.top - bounds.top,
              width: rect.width,
              height: rect.height,
            });
          }
        });
        const relations = calculateNamPhaiRelationGeometry(rects, selectedIndex, enabled);
        const paths = relations.map(({ source, target, relationType }, index) => {
          return {
            id: `${selectedIndex}-${target.palaceId}-${relationType}-${index}`,
            type: relationType,
            d: `M ${source.x} ${source.y} L ${target.x} ${target.y}`,
          };
        });
        setGeometry({ width: bounds.width, height: bounds.height, paths });
      });
    };

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(container);
    container.querySelectorAll<HTMLElement>('[data-palace-index]').forEach((cell) => observer?.observe(cell));
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    document.fonts?.ready.then(measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [containerRef, selectedIndex, enabled.lines, enabled.tamHop, enabled.xungChieu, enabled.giapCung]);

  if (!geometry.paths.length) return null;
  return <svg className="nam-phai-relation-overlay" viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-label="Quan hệ Tam Phương Tứ Chính và Giáp Cung">
    {geometry.paths.map((path) => <path key={path.id} d={path.d} className={`nam-phai-relation-line ${path.type}`} />)}
  </svg>;
};
