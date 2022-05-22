import React, { useCallback, useState, useMemo } from "react";
import { Group } from "@visx/group";
import { Line, Bar } from "@visx/shape";
import { localPoint } from "@visx/event";
import { noop, isNil, map } from "lodash";

export default function ChartOverlays({
  height,
  width,
  xScale,
  yScale,
  dataSeries,
  variant,
  offsetLeft = 0,
  offsetTop = 0,
  onHover = noop,
  onMouseLeave = noop,
}) {
  const [mouseEvent, setMouseEvent] = useState();
  const [pointerCoords, setPointerCoords] = useState();
  const isLocationDefined = useMemo(
    () => (pointerCoords?.y ?? false) && (pointerCoords?.x ?? false),
    [pointerCoords?.x, pointerCoords?.y]
  );

  const handleHover = useCallback(
    (pointGroup) => (event) => {
      const { x, y } = localPoint(event.target, event) || {
        x: undefined,
        y: undefined,
      };
      setPointerCoords({
        x: x ? x - offsetLeft : 0,
        y: y ? y - offsetTop : 0,
      });
      setMouseEvent(event);
      onHover(event, pointGroup);
    },
    [onHover, offsetLeft, offsetTop]
  );

  const handleMouseLeave = useCallback(
    (pointGroup) => (event) => {
      if (!pointGroup) {
        setPointerCoords({
          x: undefined,
          y: undefined,
        });
      }
      setMouseEvent(event);
      onMouseLeave(event, pointGroup);
    },
    [onMouseLeave]
  );

  return (
    <Group width={width} height={height} top={offsetTop} left={offsetLeft}>
      <Bar
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleHover()}
        onMouseLeave={handleMouseLeave()}
        pointerEvents="all"
      />
      {isLocationDefined && (
        <Group pointerEvents="none">
          <Line
            from={{ x: pointerCoords?.x, y: 0 }}
            to={{ x: pointerCoords?.x, y: height }}
            stroke={"red"}
            strokeWidth={1}
            pointerEvents="none"
            strokeDasharray="3,2"
          />
          <Line
            from={{ x: 0, y: pointerCoords?.y }}
            to={{
              x: width,
              y: pointerCoords?.y,
            }}
            stroke={"red"}
            strokeWidth={1}
            pointerEvents="none"
            strokeDasharray="3,2"
          />
        </Group>
      )}
    </Group>
  );
}
