import { LegendLinear, LegendItem } from "@visx/legend";

import "./MapLegend.scss";

const legendGlyphHeight = 20;
const legendGlyphWidth = 60;

const MapLegend = ({ scale, label }) => {
  return (
    // <LegendDemo title="Threshold">
    <div className="MapLegend">
      <h3 className="MapLegend__header">{label}</h3>
      <LegendLinear scale={scale}>
        {(labels) => (
          <div className="MapLegend__items">
            {labels.map((label, i) => {
              const width = Math.max(legendGlyphWidth, `${label.text}`.length * 8);
              return (
                <LegendItem key={`legend-quantile-${i}`}>
                  <svg width={width} height={legendGlyphHeight}>
                    <g>
                      <rect fill={label.value} x={0} y={0} width={width} height={legendGlyphHeight} />
                      <text x="50%" y="50%" className={"MapLegend__label"}>
                        {Math.round(label.text)}
                      </text>
                    </g>
                  </svg>
                </LegendItem>
              );
            })}
          </div>
        )}
      </LegendLinear>
    </div>
  );
};

export default MapLegend;
